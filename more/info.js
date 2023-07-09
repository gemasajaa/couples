const axios = require('axios');
const crypto = require('crypto-js');
const config = {
	username:"0895605801484",
	apiKey:'63764243965e5e29'
}
const paymentConfig = {
	va:'1179000899',
	apikey:'QbGcoO0Qds9sQFDmY0MWg1Tq.xtuh1',
	demourl:'https://sandbox.ipaymu.com/api/v2/payment/direct',
	productionurl:'https://my.ipaymu.com/api/v2/payment'
}
const sign = '7ad0dabf608f08ace635ece4d5393b3d';
const md5 = require('./md5');
const filterString = require('./stringfilter');
module.exports = function(type,req,res,db){
	const schema = {
		pricelist:{
			all(req,res){
				db.ref('tweakdataconfig').get().then(data=>{
					const valueddata = data.val();
					db.ref('markupPriceList').get().then(datamarkup=>{
						const markupData = datamarkup.val();
						this.request(res,sign,'','',valueddata,markupData);
					})
				})
			},
			pulsa(req,res){
				this.request(res,sign,'pulsa',req.query.operator);
			},
			data(req,res){
				this.request(res,sign,'data',req.query.operator);
			},
			pln(req,res){
				this.request(res,sign,'pln',req.query.operator);
			},
			games(req,res){
				this.request(res,sign,'game',req.query.operator);
			},
			voucher(req,res){
				this.request(res,sign,'voucher',req.query.operator);
			},
			request(res,sign,type,operator='',tweaks,markupPriceList){
				// axios.get('https://api.tokovoucher.id/produk/code?member_code=M230618KCLS1906XT&signature=f61bf1a2a98739e2110613d2ccb765ff&'
				// ).then(resp=>{
				// 	res.json(resp.data);
				// })
				const devkey = 'dev-da2994f0-0eb9-11ee-af39-e78992aaf8f1';
				const username = 'gesawegwMkJD';
				const data = {
					cmd:'prepaid',
					username,
					sign:md5(username+devkey+'pricelist')
				}
				axios.post('https://api.digiflazz.com/v1/price-list',data,{
					headers:{
						"content-type":"application/json"
					}
				}).then(resp=>{
					res.json({base:resp.data,tweaks,markupPriceList});
				})
			},
			order(req,res,db){
				const producttoreq = [];
				//parsing the data.
				for(let i in req.body.products){
					if(i!=='ammount' && i!=='len'){
						producttoreq.push(req.body.products[i]);
					}
				}
				const devkey = 'dev-da2994f0-0eb9-11ee-af39-e78992aaf8f1';
				const username = 'gesawegwMkJD';
				let reqLen = 0;
				const customer_no = req.body.type==='games'?req.body.targetData.gameid+req.body.targetData.serverid:req.body.targetData.hp;
				const responseBucket = {};
				const doOrder = ()=>{
					const data = {
						username,
						customer_no,
						sign:md5(username+devkey+producttoreq[reqLen].ref_id),
						ref_id:producttoreq[reqLen].ref_id,
						buyer_sku_code:producttoreq[reqLen].buyer_sku_code,
						testing:true
					}
					axios.post('https://api.digiflazz.com/v1/transaction',data,{
						headers:{
							"content-type":"application/json"
						}
					}).then(resp=>{
						responseBucket[resp.data.data.ref_id] = resp.data.data;
						reqLen += 1;
						if(reqLen<req.body.products.len){
							doOrder();
						}else{
							db.ref('digiflazzbucketinfo').update(responseBucket).then(()=>{
								console.log('updatePesananBerhasil');
							})
						}
					})
				}
				doOrder();
			}
		},
		orderCheck:{
			check(req,res){
				const data = {
					username:config.username,
					commands:'inquiry',
					sign:md5(config.username+config.apiKey+req.query.trxid),
					ref_id:req.query.trxid
				}
				axios.post('https://testprepaid.mobilepulsa.net//v1/legacy/index/',data,{
					headers:{
						"content-type":"application/json"
					}
				}).then(resp=>{
					res.json(resp.data);
				})
			}
		},
		order:{
			gmarketsaldopay(req,res,db){
				req.on('data',(data)=>{
					req.body = JSON.parse(data.toString());
					userid = req.body.userInfo.split('@')[0];
					db.ref(`users/${userid}`).get().then(data=>{
						data = data.val()||{};
						let vouchermsg;
						const doprocess = (voucherdata)=>{
							if(voucherdata){
								if(voucherdata.category){
									if(data.myvoucherusedlist && data.myvoucherusedlist.includes(voucherdata.id))vouchermsg = 'Voucher Sudah digunakan!';
									else{
										let productsInfo;
										for(let i in req.body.products){
											if(i!=='ammount' && i!=='len'){
												productsInfo = req.body.products[i].category+req.body.products[i].brand;
												break;
											}
										}
										if(productsInfo === voucherdata.category+voucherdata.type){
											if(Date.parse(voucherdata.expired)>=new Date().getTime()){
												vouchermsg = 'Voucher Berhasil Digunakan!';
												req.body.products.ammount = req.body.products.ammount - req.body.products.ammount*Number(voucherdata.pricecutter)/100;
												if(data.myvoucherusedlist)data.myvoucherusedlist.push(voucherdata.id);
												else data.myvoucherusedlist = [voucherdata.id];
											}else vouchermsg = 'Voucher Kadaluarsa!';
										}else vouchermsg = 'Voucher tidak support';
									}
								}else vouchermsg = 'Voucher tidak ditemukan!';
							}
							
							if(data.ballance >= req.body.products.ammount){
								const leftballance = data.ballance-req.body.products.ammount;
								if(!data.Trxs)data.Trxs = [{
									id:`GMTrx${req.body.timestamp}`,
									details:req.body,
									status:'done'
								}];
								else data.Trxs.push({
									id:`GMTrx${req.body.timestamp}`,
									details:req.body,
									status:'done'
								});
								const updatePaymentInfo = {
									payment:'GMarketSaldo',
									moredetails:req.body,
									status:'done',
									ammount:req.body.products.ammount
								}
								if(vouchermsg)updatePaymentInfo.vouchermsg = vouchermsg;
								const forUpdate = {ballance:leftballance,Trxs:data.Trxs};
								if(data.myvoucherusedlist){
									forUpdate.myvoucherusedlist = data.myvoucherusedlist;
								}
								db.ref(`users/${userid}`).update(forUpdate).then(()=>{
									db.ref(`history/GMTrx${req.body.timestamp}`).set(updatePaymentInfo).then(()=>{
										//schema.pricelist.order(req,res,db);
										res.json({valid:true,vouchermsg,msg:'Pembayaran Berhasil, sedang memproses pesanan anda!',leftballance,mystrxs:data.Trxs})
									})
								})
							}else res.json({valid:false,msg:'Saldo Tidak Cukup!',vouchermsg})
						}
						if(req.body.targetData.voucher){
							db.ref(`vouchers/${req.body.targetData.voucher}`).get().then(voucherdata=>{
								voucherdata = voucherdata.val()||{};
								doprocess(voucherdata);
							}); 
						}else doprocess();
					})
				})
				
			},
			orderPay(req,res,db){
				req.on('data',(bodydata)=>{
					req.body = JSON.parse(bodydata.toString());
					const paymentInfo = req.body.payment.split('.');
					const data = {
						name:req.body.validationData.name,
						phone:req.body.validationData.phone,
						email:req.body.validationData.email,
						amount:req.body.products.ammount,
						comments:"GMarket Payment",
						"notifyUrl":"https://gemastore.cyclic.app/paymentcallback", // your callback url
						"referenceId":`GMTrx${req.body.timestamp}`, // your reference id or transaction id
						"paymentMethod":paymentInfo[0],
						"paymentChannel":paymentInfo[1]
					};
					const timestamp = req.body.timestamp;
					let bodyEncrypt = crypto.SHA256(JSON.stringify(data));
					let stringtosign = "POST:"+paymentConfig.va+":"+bodyEncrypt+":"+paymentConfig.apikey;
					let signature = crypto.enc.Hex.stringify(crypto.HmacSHA256(stringtosign, paymentConfig.apikey));
					fetch(
						paymentConfig.demourl,
						{
							method: "POST",
							headers: {
								Accept: 'application/json', 'Content-Type': 'application/json',
								va: paymentConfig.va,
								signature,
								timestamp
							},
							body: JSON.stringify(data)
						}
					)
					.then((response) => response.json())
					.then((responseJson) => {
						if(responseJson.Success){
							const userid = req.body.validationData.email.split('@')[0];
							db.ref(`users/${userid}`).get().then(data=>{
								data = data.val()||{};
								if(!data.Trxs)data.Trxs = [{
									id:`GMTrx${req.body.timestamp}`,
									details:req.body,
									status:'pending',
									paymentCode:responseJson.Data.PaymentNo,
									expired:responseJson.Data.Expired
								}];
								else data.Trxs.push({
									id:`GMTrx${req.body.timestamp}`,
									details:req.body,
									status:'pending',
									paymentCode:responseJson.Data.PaymentNo,
									expired:responseJson.Data.Expired
								});
								db.ref(`users/${userid}`).update({Trxs:data.Trxs}).then(()=>{
									db.ref(`history/GMTrx${req.body.timestamp}`).set({
										payment:req.body.payment,
										moredetails:req.body,
										status:'pending',
										paymentCode:responseJson.Data.PaymentNo,
										expired:responseJson.Data.Expired
									}).then(()=>{
										res.json({trxdata:data.Trxs,responseJson});
									})
								})
							})
						}else {
							res.json({responseJson});
						}
					})
				})
			}
		}
		
	}
	//handling blocking host.
	if(req.header.Host==='localhost:8080'||req.header.Host===undefined){
		if(schema[type][req.query.type]){
			//handling 'spaces'.
			if(req.query.operator)req.query.operator = filterString(req.query.operator,'%20',' ');
			schema[type][req.query.type](req,res,db);
		}else res.json({msg:'invalid type given'})
	}else{
		res.json({msg:'access_denied'});
	}
}





