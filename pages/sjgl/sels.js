// 司机选择
import * as Xsp from "../../utils/plus.js";
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		driverList:[],
		driverIndex:-1,
		searchCount:88888888,
	},
	onInputDone: function(evt){
		var txt = evt.detail.keywords;
		var count = 0;
		var list = this.data.driverList;

		list.forEach(function(item, index){
			if(!txt || item.driverName.indexOf(txt) >= 0){
				item.isHide = false;
				count++;
			}else{
				item.isHide = true;
			}
		});

		this.setData({
			driverList: list,
			searchCount: count
		});
	},
	onDriverSelected: function(evt){
		var nth = Xsp.getArgs(evt, "index");
		var obj = {
			detail: { value: nth }
		};

		Xsp.getPrevPage().onDriverChanged(obj);
		wx.navigateBack();
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var dlist = Xsp.getPrevPage().data.driverList;

		dlist.forEach(function(item, index){
			item.isHide = false;
		});

		this.setData({
			driverList: dlist,
			driverIndex: (+options.nth || 0)
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