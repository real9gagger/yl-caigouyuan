// 新增旋切机主
var Xsp = require("../../utils/plus.js");
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isAjaxing: false,
		errorIndex: 0,
		errMsgText: "",
		completeNames: [],
		completeTimerID: 0,
		completeBoxShow: false,

		form_id: 0,
		form_name: "",
		form_idcard: "",
		form_phone: "",
		form_address: ""
	},
	gotoMaper:function(){
		Xsp.gotoPage("../maper/maper?address=" + this.data.form_address);
	},
	setFormattedAdrress:function(addr){
		this.setData({
			form_address: addr
		});
	},
	onSubmitInfo: function(){
		var $me = this;
		var $data = $me.data;
		var ecode = 0;

		$me.setData({
			form_name:  $data.form_name.trim(),
			form_phone: $data.form_phone.trim()
		});

		if(!$data.form_name){
			ecode = 1;
		}/*else if(!$data.form_idcard){
			ecode = 2;
		}*/else if(!$data.form_phone){
			ecode = 3;
		}else if(!$data.form_address){
			ecode = 4;
		}

		if(ecode){
			this.setData({ errorIndex: ecode, errMsgText: "此项必填" })
			setTimeout(() => { $me.setData({ errorIndex: 0, errMsgText: "" }) }, 3000);
			/*wx.showToast({ 
				title: "此项不能为空",
				duration: 2000, 
				icon: "none"
			});*/
			return;
		}

		$me.setData({ isAjaxing: false });

		Xsp.postData("rms/rotarycutteruser/saveOrUpdateRcuDTO", {
			"id": 			$data.form_id ? $data.form_id : undefined,
			"name" : 		$data.form_name,
			"idcard": 		$data.form_idcard,
			"phone": 		$data.form_phone,
			"diAddress": 	$data.form_address
		}, function(res, errcode){
			if(errcode===0){
				wx.showToast({ 
					title: "已保存", 
					duration: 1000, 
					icon:"none" 
				});
				setTimeout(() => wx.navigateBack(), 500);
				Xsp.getPrevPage().onLoad({});
			}
		});
	},
	getJzListByName: function(evt){
		var $me = this;
		var keyword = evt.detail.value.trim();

		clearTimeout($me.data.completeTimerID);

		if(!keyword){
			$me.setData({ completeNames: [] });
			return;
		}

		var tmid = setTimeout(function (){
			$me.setData({ completeNames: null });
        	Xsp.getData("rms/rotarycutteruser/getXqjAutoCompleteByName", {name: keyword}, function(res){
        	  	$me.setData({ completeNames: (res || []) });
        	});
		}, 500);

		$me.setData({ completeTimerID: tmid });

		return;
	},
	onAutoCompleteTaped: function(evt){
		var nth = Xsp.getArgs(evt, "nth");
		var item = this.data.completeNames[nth];
		var $me = this;

		$me.setData({
			form_id: 		0,
			form_name: 		item.name,
			form_idcard: 	(item.idCard || ""),
			form_phone: 	(item.phone || ""),
			form_address: 	(item.address && item.address.length ? item.address[0] : ""),
		});

		setTimeout(function () {//设置一个延迟，等动画执行完成
			$me.setData({
				completeBoxShow: false
			});
		}, 300);
	},
	onNameClicked: function(){
		var $me = this;
		if(!$me.data.form_id){ //新增的才显示搜索面板
			$me.setData({
				completeBoxShow: true
			});
		}
	},
	onInputDone: function(){
		var $me = this;
		setTimeout(function () {//设置一个延迟，等动画执行完成
			$me.setData({
				completeBoxShow: false
			});
		}, 300);
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		if(options.is_edit){
			try{
				var infos = JSON.parse(wx.getStorageSync("jhb_xqjz_infos"));
				this.setData({
					form_id: 		infos.jzid,
					form_name: 		infos.jzname,
					form_idcard: 	infos.idcard,
					form_phone: 	infos.phone,
					form_address: 	infos.address
				});
				wx.setNavigationBarTitle({ title: "修改机主信息" });
				wx.removeStorageSync("jhb_xqjz_infos");
			}catch(ex){
				console.log(ex);
			}
		}
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})