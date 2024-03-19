// 采购小程序主页
import * as Xsp from "../../utils/plus.js";
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		viewMarginBottom:55,
		xqList:[] //需求列表
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		wx.hideTabBar({ animation: false }); //隐藏小程序自带的底部栏
		var $me = this;
		setTimeout(function() { //避免无法立即获取底部栏高度，要等 500 毫秒
			$me.setData({
				viewMarginBottom: getApp().globalData.bottomBarHeight
			});
		}, 500);
		$me.getPageData();
	},
	getPageData: function(){
		var $me = this;
		var params = {
			pageNo: 1,
			pageSize: 10,
			publishStatus: 2
		};
		$me.setData({xqList: null});
		Xsp.getData("trade/supplypublish/getSupplyPageFromJhb", params, function(res) {
			if(res.records && res.records.length){
				let xqreg = /^广西壮族自治区/gim;
				let xqset = [];
				res.records.forEach(function(item) {
					let goods = (item.goodsList && item.goodsList.length ? item.goodsList[0] : {});
					xqset.push({
						spID:			(item.id || 0),
						endDate: 		(item.finishTime ? item.finishTime.substr(0, 10) : ""),
						spAddress: 		(item.address || "").replace(xqreg, ""),
						goodsCategory:	(goods.goodsCategoryName || "某分类"),
						goodsName: 		(goods.goodsName || "某货物"),
						goodsNums: 		(goods.volume || 0),
						goodsDesc:		(goods.description || ""),
						unitPrice: 		(goods.unitPrice || 0).toFixed(2),
						totalPrice: 	(goods.totalPrice || 0).toFixed(2),
					});
				});
				$me.setData({ xqList: xqset });
			}else{
				$me.setData({ xqList: [] });
			}
		});
	},
	gotoSubPage: function(e){
		Xsp.gotoPage(Xsp.getArgs(e, "url"));
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