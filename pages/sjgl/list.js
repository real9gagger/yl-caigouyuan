import * as Xsp from "../../utils/plus.js";
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		driverList:[],
		searchCount:-1,
		picBaseUrl: Xsp.globalvars.PIC_BASE_URL,
		pageSszjBox: null
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		//获取司机列表
		var $me = this;
		Xsp.getData("rms/driverlist/findDriverVOPage", {"current": 1, "size": 500}, function(results){
			var dlist = (results.records || []).map((infos)=>{
				var imgList= [];
				if(infos.idcardNoFrontFileId){
					imgList.push(infos.idcardNoFrontFileId); //身份证正面照
				}
				if(infos.idcardNoBackFileId){
					imgList.push(infos.idcardNoBackFileId); //身份证背面照
				}
				if(infos.driveLicenceFrontFileId){
					imgList.push(infos.driveLicenceFrontFileId); //驾驶证正面照
				}
				if(infos.driveLicenceBackFileId){
					imgList.push(infos.driveLicenceBackFileId); //驾驶证背面照
				}

			  	return { 
				  	"driverId": infos.did, 
				  	"driverName": infos.name || "[无名]",
					"driverPhone": infos.phone || "",
					"driverNo": infos.driverNo || "",
					"idcardNo": infos.idcardNo || "",
					//"driveLicenceBackFileGuId": 	infos.driveLicenceBackFileGuId,
					//"driverBid": infos.driveLicenceBackFileId,
					//"driveLicenceFrontFileGuId": 	infos.driveLicenceFrontFileGuId,
					//"driverFid": infos.driveLicenceFrontFileId,
					//"idcardNoBackFileGuId": 		infos.idcardNoBackFileGuId,
					//"idcardBid": infos.idcardNoBackFileId,
					//"idcardNoFrontFileGuId": 		infos.idcardNoFrontFileGuId,
					//"idcardFid": infos.idcardNoFrontFileId,
					"imageList": [],//日期暂时注释掉 imgList,
					"isHide": false
			  	}
			});
			$me.setData({ 
				driverList: dlist,
				searchCount: dlist.length,
				pageSszjBox: $me.selectComponent("#page_sszj_box")
			});
			wx.stopPullDownRefresh(); //停止下拉刷新
		});

	},

	getNumberWithAsterisk: function(input){
		if(input){
			return (
				input.substr(0, 2) + 
				"******************************".substr(0, input.length - 3) +
				input.substr(input.length - 1)
			);
		}
		return "";
	},

	gotoXzSj: function(){//转到新增司机
		Xsp.gotoPage("adds");
	},

	editSjInfo: function(evt){//编辑司机信息
		var nth = Xsp.getArgs(evt, "index");
		var did = this.data.driverList[nth].driverId;
		Xsp.gotoPage("adds?did=" + did);
	},

	onInputDone: function(evt){
		var txt = evt.detail.keywords.trim();
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

	onFuckingScroll: function (evt) {
		//console.log(evt)
		var $me = this;
		if(evt.detail.deltaY > 5){ //向上滑动
			$me.data.pageSszjBox.setSlideInOut(0);
		}else if(evt.detail.deltaY < -5){//向下滑动
			$me.data.pageSszjBox.setSlideInOut(2);
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