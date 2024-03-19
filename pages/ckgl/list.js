// 仓库列表
var Xsp = require("../../utils/plus.js");
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		ckdzInfo: {}
	},
	gotoXzdz:function(){
		Xsp.gotoPage("../ckgl/adds");
	},
	editCkInfo:function(evt){//编辑仓库信息
		var nth = Xsp.getArgs(evt, "nth");
		var infos = this.data.ckdzInfo.jhbAddresses[nth];

		wx.setStorageSync("jhb_cangku_infos", JSON.stringify(infos));

		Xsp.gotoPage("../ckgl/adds?is_edit=1");
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var $me = this;
		Xsp.getData("rms/jhblist/getJhbDTO", {}, function(res){
			if(!res.jhbAddresses){
				res.jhbAddresses = [];
			}
			$me.setData({ ckdzInfo: res });
			wx.stopPullDownRefresh(); //停止下拉刷新
		});
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
		this.onLoad();
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