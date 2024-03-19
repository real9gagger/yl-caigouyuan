// 下单成功
import * as Xsp from "../../utils/plus.js";
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		orderNo: "202112120000000" //订单号
	},

	jixuXd:function(){ //继续下单
		wx.navigateBack();
	},
	chakanDd:function(){ //查看订单
		Xsp.gotoPage("../ddgl/list", 1);
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		let $me = this;
		let orderID = options.orderid;
		if(orderID){
			Xsp.getData("order/orderlist/getOrderDetail", {"orderId": orderID}, function(res){
				//console.log(res)
				$me.setData({
					orderNo: res.orderCode
				});
			});
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