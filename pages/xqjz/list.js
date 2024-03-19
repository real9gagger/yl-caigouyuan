// 旋切机主列表
import * as Xsp from "../../utils/plus.js";
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		xqjzList: null,
		searchCount:1,
		addBtnTimerID:0,
		isScrolling:false, //是否正在滚动页面
		oldScrollTop:0,
		pageSszjBox:null,
	},
	callXqjz: function(e){ //打电话给旋切机主
		wx.makePhoneCall({
		  phoneNumber: Xsp.getArgs(e, "phone")
		});
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
	editXqjz: function(evt){
		var ix0 = Xsp.getArgs(evt, "ix0");
		var ix1 = Xsp.getArgs(evt, "ix1");
		var item0 = this.data.xqjzList[ix0];
		var item1 = item0.devices[ix1];
		var infos = {
			jzid: 		item0.id,
			jzname: 	item0.name,
			idcard: 	item0.idcard,
			phone: 		item0.phone,
			address: 	item1.diAddress
		};
		wx.setStorageSync("jhb_xqjz_infos", JSON.stringify(infos));

		Xsp.gotoPage("../xqjz/adds?is_edit=1");
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var $me = this;
		Xsp.getOrderDeliver(function(ckInfo, jzList) {
			$me.setData({
				xqjzList: jzList
			});
			wx.stopPullDownRefresh(); //停止下拉刷新
			/*setTimeout(function(){
				$me.setData({
					pageSszjBox: $me.selectComponent("#page_sszj_box")
				});
			}, 500);*/
		}, true);
	},
	
	/**
	 * 生命周期函数--监听页面滚动
	 */
	onPageScroll: function (evt) {
		var $me = this;
		var timerID = 0;

		clearTimeout($me.data.addBtnTimerID);

		timerID = setTimeout(function() {
			$me.setData({ isScrolling: false });
		}, 750);

		/*if(evt.scrollTop < $me.data.oldScrollTop){ //向上滑动
			$me.data.pageSszjBox.setSlideInOut(0);
		}else {//向下滑动
			$me.data.pageSszjBox.setSlideInOut(3);
		}*/

		$me.setData({
			isScrolling: true,
			addBtnTimerID: timerID,
			oldScrollTop: evt.scrollTop
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