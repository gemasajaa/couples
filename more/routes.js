const view = require('./view');
const fm = require('./fileH');
// const db = require('./firebase');
// const moreinfo = require('./info');
// const handleRegis = require('./newuserhandler')
// const emailVerifier = require('./emailVerifier');
// const loginhandler = require('./loginhandler');
// const sendotphandler = require('./otphandler');
// const adminpanelhandler = require('./adminpanel');
// const handlepaymentcallback = require('./paymentcallbackhandler');
// const transactionChecker = require('./transactionchecker');
// const changedatauserhandler = require('./datauserchanger');
// const topupuserhandler = require('./topupuserhandler');
// const handlepaymentcallbackdeposit = require('./paymentcallbackhandlerdeposit');
// const sessionUpdater = require('./updateSession');
module.exports = [
	{
		mM:'get',
		'/'(req,res){
			view.go('index',req,res);
		}
	},
	{
		mM:'get',
		'/scripts'(req,res){
			fm.do(req,res);
		}
	},
	{
		mM:'get',
		'/styles'(req,res){
			fm.do(req,res);
		}
	},
	{
		mM:'get',
		'/file'(req,res){
			fm.do(req,res);
		}
	},
	{
		mM:'get',
		'/audio'(req,res){
			fm.do(req,res);
		}
	}
];
