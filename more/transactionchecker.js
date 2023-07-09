module.exports = function(req,res,db){
  const trxid = req.query.trxid;
  db.ref('history/'+trxid).get().then(data=>{
    const valuedData = data.val()||{};
    res.json(valuedData);
  })
}