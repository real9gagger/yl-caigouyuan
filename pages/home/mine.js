// 个人中心（我的）
import * as Xsp from "../../utils/plus.js";
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		viewMarginBottom: 55,
		myUserName: "",
		myUserPhone: "",
		myUserAvatar: "" //用户头像
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

		if(!$me.data.myUserName){
			let pcode = wx.getStorageSync("cur_user_plywood_code") || "0";
			Xsp.getData("rms/jhblist/" + pcode,{isEnableAjaxCache: true}, function(res){
				$me.setData({
					myUserName: res.name,
					myUserPhone: res.phone
				});
			});
		}

		try{
            let uinfos = JSON.parse(wx.getStorageSync("my_wx_account_profiles")); //微信用户资料
            if(uinfos){
                this.setData({ myUserAvatar: uinfos.avatarUrl });
            }
        }catch(ex){
            console.log(ex);
		}
	},

	gotoSubPage: function(e){
		Xsp.gotoPage(Xsp.getArgs(e, "url"));
	},

	unOpenTips: function(){
		wx.showToast({
			title: "功能暂未开放！",
			icon: "none",
			duration: 2000
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
		setTimeout(function(){
			wx.stopPullDownRefresh(); //停止下拉刷新
		}, 500);
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