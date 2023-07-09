const fs = require('fs');
const fileTypeHandler = require('./fileTypeHandler');
module.exports = {
	do(req,res){
		this[req.path](req.query.fn,res,req.query.dir);
	},
	"/scripts"(fn,res){
		res.file(`./more/public/scripts/${fn}.js`,{'content-type':'text/javascript'});
	},
	"/styles"(fn,res){
		res.file(`./more/public/styles/${fn}.css`,{'content-type':'text/css'});
	},
	"/html"(fn,res,cDir='public/media'){
		res.file(`./more/${cDir}/${fn}`,{'content-type':'text/html'});
	},
	"/file"(fn,res,cDir='public/media',type={'content-type':''}){
		//handline filetype.
		type['content-type'] = `image/${fn.split('.')[1]}`;
		res.file(`./more/${cDir}/${fn}`,type);
	},
	"/audio"(fn,res,cDir='public/media',type={'content-type':''}){
		//handline filetype.
		type['content-type'] = `audio/${fn.split('.')[1]}`;
		res.file(`./more/${cDir}/${fn}`,type);
	}
}