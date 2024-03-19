// 地址仓库
var Xsp = require("../../utils/plus.js");
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		ckdzInfo: {},
		selectedJaID: 0,
	},
	gotoXzdz:function(){
		Xsp.gotoPage("../ckgl/adds");
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var $me = this;
		
		$me.setData({
			selectedJaID: (options.ckid || 0) //已选择的仓库地址
		});

		Xsp.getOrderDeliver(function(ckInfo, jzList) {
			$me.setData({ ckdzInfo: ckInfo });
		});
	},
	selectCk:function(e){
		var $me = this;
		var nth = Xsp.getArgs(e, "nth");
		var item = $me.data.ckdzInfo.jhbAddresses[nth];

		Xsp.getPrevPage().setWareHoureInfos(
			item.jaid,
			item.warehouseName,
			item.address,
			$me.data.ckdzInfo.plywoodCode,
			$me.data.ckdzInfo.name,
			$me.data.ckdzInfo.phone,
		);

		wx.navigateBack();
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