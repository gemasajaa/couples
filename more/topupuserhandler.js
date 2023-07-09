const crypto = require('crypto-js');
const paymentConfig = {
	va:'1179000899',
	apikey:'QbGcoO0Qds9sQFDmY0MWg1Tq.xtuh1',
	demourl:'https://sandbox.ipaymu.com/api/v2/payment/direct',
	productionurl:'https://my.ipaymu.com/api/v2/payment'
}
module.exports = function(req,res,db){
  req.on('data',data=>{
    const reqdata = JSON.parse(data.toString());
    const userId = reqdata.userInfo.split('@')[0];
    const timestamp = reqdata.timestamp;
    const payment = reqdata.userData.payment.split('.');
    const nominalTopup = reqdata.userData.topupNominal;
    db.ref(`users/${userId}`).get().then(datax=>{
      const userdata = datax.val();
      const data = {
        name:userdata.name,
        phone:userdata.hp,
        email:userdata.email,
        amount:nominalTopup,
        comments:"GMarket Payment",
        "notifyUrl":"https://gemastore.cyclic.app/depositpaymentcallback", // your callback url
        "referenceId":`GMTPP${timestamp}`, // your reference id or transaction id
        "paymentMethod":payment[0],
        "paymentChannel":payment[1]
      };
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
          db.ref(`deposit/${responseJson.Data.SessionId}`).update({responseJson,userId,status:'pending'}).then(()=>{
            res.json(responseJson);
          })
        }else res.json(responseJson);
      })
    })
    
  })
}