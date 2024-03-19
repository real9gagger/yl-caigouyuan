var CryptoJS = require("./crypto.js");
var API_ACCESS_TOKEN = wx.getStorageSync("api_access_token_str");

const globalvars =  { //正式环境
	API_BASE_URL:"https://service.ys.jhb.beefast.net:9999/", //正式环境
	FILE_GET_URL:"https://service.ys.beefast.net/api/file/", //上传文件接口
	PIC_BASE_URL:"https://file.beefast.net/api/filetransfer/preview?userFileId=", //图片预览ID
	IS_TEST_ENVI:false //是否是测试环境
}

if(__wxConfig.envVersion !== "release"){ //体验版或者开发版
	globalvars["API_BASE_URL"] = "https://service.ys.test.beefast.net:9999/"; //测试环境
	globalvars["FILE_GET_URL"] = "https://service.ys.beefast.net:58111/api/file/";
	globalvars["IS_TEST_ENVI"] = true;
}

export { globalvars }

export function gotoPage(url, type){
	wx.showLoading({
		title: "加载中",
		icon: "loading",
		duration: 1000
	});
	
	if(!type){
		wx.navigateTo({ url: url });
	}else if(type===1){
		wx.redirectTo({ url: url });
	}else if(type===2){
		wx.switchTab({ url: url });
	}
}

export function getArgs(e, k){
	if(k){
		return e.currentTarget.dataset[k];
	}else{
		return e.currentTarget.dataset;
	}
}

export function getData(api, params, success, error){
	var get_hds = {
		"Authorization": API_ACCESS_TOKEN
	}
	wx.request({
		url: globalvars.API_BASE_URL + api,
		method: "GET",
		header: get_hds,
		data: params,
		enableCache: !!params.isEnableAjaxCache,
		success: function(res){
			let msgCode = (res.code || 0);
			if(msgCode !== 0){
				let msgText = (res.data ? JSON.stringify(res.data) : "未知错误"); 
				wx.showModal({
					title: 		"提示",
					content: 	"访问接口 " + api + " 失败：" + msgText,
					showCancel: false,
					confirmColor:"#000"
				});
				error && error();
			}else{
				success && success(res.data.data, msgCode, res.data.msg);
			}
		},
		fail: function(res){
			let errmsg = (res ? JSON.stringify(res) : "未知错误");
			wx.showModal({
				title: 		"提示",
				content: 	"访问接口 " + api + " 出错：" + errmsg,
				showCancel: false,
				confirmColor:"#000"
			});
		}
	});
}

export function postData(api, datas, success){
	wx.request({
		url: globalvars.API_BASE_URL + api,
		method: (datas.is_ajax_put_method === true ? "PUT" : "POST"),
		header: {
			"Authorization": API_ACCESS_TOKEN
		},
		data: datas,
		success: function(res){
			let msgCode = (res.data ? (res.data.code || 0) : -9999);
			if(msgCode !== 0){
				let msgText = (res.data ? res.data.msg : "") || ("未知错误"); 
				wx.showModal({
					title: 		"提示",
					content: 	msgText,
					showCancel: false,
					confirmColor:"#000"
				});
			}
			success && success(res.data.data, msgCode, res.data.msg);
		},
		fail: function(res){
			let errmsg = (res ? JSON.stringify(res) : "未知错误");
			wx.showModal({
				title: 		"提示",
				content: 	"提交数据给 " + api + " 出错：" + errmsg,
				showCancel: false,
				confirmColor:"#000"
			});
			success && success(null, -9, "");
		}
	});
}

export function getPrevPage(delta){
	var pages = getCurrentPages();
	var nths = pages.length - (delta || 1) - 1;
	if(nths >= 0){
		return pages[nths];
	}else{
		return null;
	}
}

//采购员登录
export function cgyLogin(user, pswd, done){
	var userinfo = encryption({
		data: {
		  "username": user,
		  "password": pswd,
		  "code":      8,
		  "randomStr": 100000000000000
		},
		key: "pigxpigxpigxpigx",
		param: ["password"]
	});
	var params = `auth/oauth/token?code=${userinfo.code}&randomStr=${userinfo.randomStr}&grant_type=password&scope=server`;
	wx.request({
		url: globalvars.API_BASE_URL + params,
		method: "POST",
		header: {
		  "isToken": "false",
		  "TENANT-ID": "1",
		  "Authorization": "Basic cGlnOnBpZw==",
		  "Content-Type": "application/x-www-form-urlencoded"
		},
		data: {
		  "username": userinfo.username,
		  "password": userinfo.password,
		},
		success: function(res){
			if(res.statusCode===200 && res.data && res.data.access_token){
				API_ACCESS_TOKEN = ("Bearer " + res.data.access_token);
				wx.setStorageSync("api_access_token_str", API_ACCESS_TOKEN);
				wx.setStorageSync("cur_user_plywood_code", res.data.user_info.plywoodCode); //用户企业ID
				
				if(done){
					//把微信登录成功的code发送给后台！
					wx.request({
						url: (globalvars.API_BASE_URL + "admin/social/bind?state=MINI&code=" + getApp().globalData.wxLoginSuccessCode),
						method: "POST",
						header: { "Authorization": API_ACCESS_TOKEN }
					});
					done(res.data);
				}
				//console.log("TOKEN 将在 " + res.data.expires_in + " 秒后过期");
				setTimeout(function(fuck_up) { 
					cgyLogin(fuck_up.fuck_user, fuck_up.fuck_pswd) 
				}, (res.data.expires_in - 10) * 1000, {
					"fuck_user": user,
					"fuck_pswd": pswd
				});//token 过期10秒前自动登录
			}else{
				let errmsg = (res.data ? res.data.msg : "") || "未知错误";
				wx.showModal({
					title: 		"提示",
					content: 	"登录失败：" + errmsg,
					showCancel: false,
					confirmColor:"#000"
				});
				done && done(0);
			}
		},
		fail: function(res){
			let errmsg = (res ? JSON.stringify(res) : "未知错误");
			wx.showModal({
				title: 		"提示",
				content: 	"登录出错：" + errmsg,
				showCancel: false,
				confirmColor:"#000"
			});
			done && done(0);
		}
	});
}

//微信自动登录
export function tryAutoLogin(){
	var wxcode = getApp().globalData.wxLoginSuccessCode;

	wx.request({ //自动登录
		url: (globalvars.API_BASE_URL + "auth/mobile/token/social?grant_type=mobile&mobile=MINI@" + wxcode),
		method: "POST",
		header: { "Authorization": "Basic cGlnOnBpZw==" },
		success: function(res){
			if(res.statusCode === 401){
				wx.showModal({
					title: 		"提示",
					content: 	"用户凭证已失效，请重新登录",
					showCancel: false,
					confirmColor: "#000",
					success (exo) {
						if (exo.confirm) {
							gotoPage("../index/index", 1); //自动登录失败!!
						}
					}
				});
			}else{
				API_ACCESS_TOKEN = ("Bearer " + res.data.access_token);
				wx.setStorageSync("api_access_token_str", API_ACCESS_TOKEN);
				wx.setStorageSync("cur_user_plywood_code", res.data.user_info.plywoodCode); //用户企业ID
				gotoPage("../home/home", 2);
			}
		}
	});

	wx.showLoading({
		title: "登录中...",
		icon: "loading",
		duration: 1000
	});
}

//对象转 Query String
export function toQueryParams(objs, name) {
	if(!objs){
		if(!name) 				name = "&orz";
		if(objs===0) 			return (name + "=0");
		else if(objs===false) 	return (name + "=false");
		else 					return (name + "=");
	}else if(typeof(objs) !== "object"){
		if(!name) 				name = "&orz";
		return (name + "=" + encodeURIComponent(objs));
	}

	let output = "";
	if(Array.isArray(objs)){
		if(!name){
			name = "&arz";
		}
		for (let nth in objs) {
			output += (toQueryParams(objs[nth], name + "[" + nth + "]"));
		}
	}else{
		if(!name){
			name = "&";
		}else{
			name+=".";
		}
		for (let key in objs) {
			output += (toQueryParams(objs[key], name + key));
		}
	}
	return output;
}

//是否是身份证号
export function isIDCard(input){
	if(input){
		return /^\d{17}[0-9X]$/.test(input);
	}else{
		return false;
	}
}

//是否是手机号
export function isPhoneNumber(input){
	if(input){
		return /^\d{11}$/.test(input);
	}else{
		return false;
	}
}

//获取当前账户的旋切机和仓库列表
export function getOrderDeliver(ondone, nocache) {//nocache 是否使用缓存
	var app = getApp();

	if(!nocache && app.globalData.gbCkdzInfo && app.globalData.gbXqjzList){
		console.log("正在使用全局变量的数据...");
		
		ondone && ondone(app.globalData.gbCkdzInfo, app.globalData.gbXqjzList);

		return 1;
	}else{
		getData("rms/jhblist/findOrderDeliver", {}, function(res){
			var jzlist = res.rotaryCutterUsers || [];
			let xreg = /^广西壮族自治区/gim; //删掉开头这几个字
			
			delete res.rotaryCutterUsers;
			if(!res.jhbAddresses){
				res.jhbAddresses = [];
			}

			jzlist.forEach(function(item) {
				if(item.devices){
					for(let ii = 0, nn = item.devices.length;ii < nn;ii++){
						item.devices[ii].diAddress = (item.devices[ii].diAddress || "").replace(xreg, "");
					}
				}else{
					item.devices = [];
				}
			});

			app.globalData.gbXqjzList = jzlist;
			app.globalData.gbCkdzInfo = res;

			ondone && ondone(app.globalData.gbCkdzInfo, app.globalData.gbXqjzList);
		});

		console.log("正在加载仓库地址的数据...");

		return 2;
	}
}

//登录加密
function encryption(params) {
	let { data, type, param, key } = params;
	let result = JSON.parse(JSON.stringify(data));
	if (type === "Base64") {
	  	param.forEach(ele => {
			result[ele] = btoa(result[ele]);
	  	});
	} else {
	  	param.forEach(ele => {
			var data = result[ele];
			var ivxo = CryptoJS.enc.Latin1.parse(key);
			// 加密
			var encrypted = CryptoJS.AES.encrypt(data, ivxo, {
			  	iv: ivxo,
			  	mode: CryptoJS.mode.CFB,
			  	padding: CryptoJS.pad.NoPadding
			});
			result[ele] = encrypted.toString();
	  	});
	}
	return result;
}
