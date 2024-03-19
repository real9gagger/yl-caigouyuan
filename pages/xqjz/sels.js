// 选择地址旋切机主
import * as Xsp from "../../utils/plus.js";
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		xqjzList: null,
		searchCount:1,
		addBtnTimerID:0,
		selectedSbID:0,//已选的设备ID
		isScrolling:false //是否正在滚动页面
	},
	callXqjz: function(e){ //打电话给旋切机主
		wx.makePhoneCall({
		  phoneNumber: Xsp.getArgs(e, "phone")
		});
	},
	selectXqj: function(e){
		var jzi = Xsp.getArgs(e, "jzi"), //机主 index
			jqi = Xsp.getArgs(e, "jqi"); //机器 index
		var item = this.data.xqjzList[jzi],
			xqj = item.devices[jqi];

		Xsp.getPrevPage().setFhfInfos(
			item.id,
			item.name,
			xqj.id,
			xqj.diType,
			xqj.diAddress
		);

		wx.navigateBack();
	},
	onInputDone:function(e){
		//console.log(e);
		var kws = e.detail.keywords;
		var count = 0;
		var xlist = this.data.xqjzList;
		
		if(kws){
			xlist.forEach(function(item){
				if(item.name.indexOf(kws) >= 0 || item.phone.indexOf(kws) >= 0){
					count++;
					item.isHide = false;
				}else{
					item.isHide = true;
				}
			});
		}else{
			xlist.forEach(function(item){
				item.isHide = false;
			});
			count = xlist.length;
		}

		this.setData({
			searchCount: count,
			xqjzList: xlist,
		});
	},
	addXqjz: function(){
		Xsp.gotoPage("../xqjz/adds")
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var $me = this;
		$me.setData({ selectedSbID: (options.sbid || 0) });
		
		Xsp.getOrderDeliver(function (ckInfo, jzList) {
			$me.setData({ xqjzList: jzList });
		});
	},
	
	/**
	 * 生命周期函数--监听页面滚动
	 */
	onPageScroll: function (evt) {
		/*var $me = this;
		var timerID = 0;

		clearTimeout($me.data.addBtnTimerID);

		timerID = setTimeout(function() {
			$me.setData({ isScrolling: false });
		}, 750);

		$me.setData({
			isScrolling: true,
			addBtnTimerID: timerID
		});*/
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