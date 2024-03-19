// 新增仓库
var Xsp = require("../../utils/plus.js");
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		form_name:"",
		form_phone:"",
		form_warehouse:"",
		form_address:"",
		form_jaid:0,
		form_userid:0,
		form_lon: 0,
		form_lat: 0,
		isAjaxing:false,
		isSubmitDone:false,
		errMsgText:"",
		errMsgCode:0
	},
	gotoMaper:function(){
		var dat = this.data;
		Xsp.gotoPage(`../maper/maper?address=${dat.form_address}&lat=${dat.form_lat}&lng=${dat.form_lon}`);
	},
	onSubmitInfo:function(){
		var $me = this;
		var $data = $me.data;

		if(!$data.form_name){
			$me.setData({ 
				errMsgText: "请填写仓库管理员名称",
				errMsgCode: 1
			});
		}else if(!$data.form_phone){
			$me.setData({ 
				errMsgText: "请填写仓库管理员手机号",
				errMsgCode: 2
			});
		}else if(!$data.form_warehouse){
			$me.setData({ 
				errMsgText: "请填写仓库名称",
				errMsgCode: 3
			});
		}else if(!$data.form_address){
			$me.setData({ 
				errMsgText: "请选择仓库地址",
				errMsgCode: 4
			});
		}else if(!$data.form_lon){
			$me.setData({ 
				errMsgText: "此仓库无经纬度信息，请重新选择详细地址",
				errMsgCode: 4
			});
		}
		
		if($data.errMsgText){
			setTimeout(function() { $me.setData({ errMsgText: "", errMsgCode: 0 }) }, 3000);
			return;
		}

		if($me.data.isAjaxing){
			return;
		}else{
			$me.setData({ isAjaxing: true })
		}

		var postData = [{
			//"jaid":         0, //新增的时候可不填
			//"userId":       0, //新增的时候可不填
			"name":         $data.form_name,
			"phone":        $data.form_phone,
			"warehouseName":$data.form_warehouse,
			"address":      $data.form_address,
			"lon":			$data.form_lon,
			"lat":			$data.form_lat
		}];

		if($data.form_jaid){
			postData[0]["jaid"] = $data.form_jaid;
			postData[0]["userId"] = $data.form_userid;
		}

		Xsp.postData("rms/jhblist/updateJhbAddress", {jhbAddresses: postData, is_ajax_put_method: true }, function(res, code){
			if(code === 0){
				$me.setData({ isSubmitDone: true });
				setTimeout(function(){ wx.navigateBack() }, 500);
				Xsp.getPrevPage().onLoad();
			}else{
				$me.setData({ isAjaxing: false });				
			}
        });
	},
	setFormattedAdrress:function(addr, loni, lati){
		this.setData({
			form_address: addr,
			form_lon: loni,
			form_lat: lati
		});
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		if(options.is_edit==1){
			try {
				let ckinfos = JSON.parse(wx.getStorageSync("jhb_cangku_infos"));
				wx.removeStorageSync("jhb_cangku_infos");
				this.setData({
					form_name:		ckinfos.name || "",
					form_phone:		ckinfos.phone || "",
					form_warehouse:	ckinfos.warehouseName || "",
					form_address:	ckinfos.address || "",
					form_jaid:		ckinfos.jaid || 0,
					form_userid:	ckinfos.userId || 0,
					form_lon:		ckinfos.lon || 0,
					form_lat:		ckinfos.lat || 0,
				});
				wx.setNavigationBarTitle({ title: "修改仓库信息" });
			} catch (error) {
				console.log(error);
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