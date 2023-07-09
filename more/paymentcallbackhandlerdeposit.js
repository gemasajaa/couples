module.exports = function(req,res,db){
  req.on('data',data=>{
    console.log(JSON.parse(data.toString()));
    res.writeHead(200);
  })
}