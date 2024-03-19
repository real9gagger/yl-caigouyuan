import * as Xsp from "../../utils/plus.js";
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		carList: [],
		searchCount: -1,
		picBaseUrl: Xsp.globalvars.PIC_BASE_URL,
		pageSszjBox: null
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var $me = this;
		Xsp.getData("rms/carlist/findCarVOPage", {"current": 1, "size": 500}, function(results){
			var dlist = (results.records || []).map((infos)=>{
				var imgList= [];
				if(infos.drivingLicenseFileId){
					imgList.push(infos.drivingLicenseFileId); //行驶证
				}
				if(infos.operationCertificateFileId){
					imgList.push(infos.operationCertificateFileId); //运营证
				}

			  	return { 
				  	"carId": infos.cid, 
				  	"carNo": infos.carNo || "[车牌号]",
					"carLicense": infos.carLicense || "", //行驶证号
					"businessLicense": infos.businessLicense || "", //运营证号
					"imageList": imgList,
					//"imageColor": (imgList.length===0 ? $me.getCarColor(infos.cid) : ""),
					"imageText": (infos.carNo ? infos.carNo.substr(0 , 2) : "崋A"),
					"isHide": false
			  	}
			});
			$me.setData({ 
				carList: dlist,
				searchCount: dlist.length,
				pageSszjBox: $me.selectComponent("#page_sszj_box")
			});
			wx.stopPullDownRefresh(); //停止下拉刷新
		});
	},

	onInputDone: function(evt){
		var txt = evt.detail.keywords.trim();
		var count = 0;
		var list = this.data.carList;

		list.forEach(function(item, index){
			if(!txt || item.carNo.indexOf(txt) >= 0){
				item.isHide = false;
				count++;
			}else{
				item.isHide = true;
			}
		});

		this.setData({
			carList: list,
			searchCount: count
		});
	},

	gotoXzCl: function(){//转到新增车辆
		Xsp.gotoPage("adds");
	},

	editClInfo: function(evt){//编辑车辆信息
		var nth = Xsp.getArgs(evt, "index");
		var did = this.data.carList[nth].carId;
		Xsp.gotoPage("adds?cid=" + did);
	},

	getCarColor: function(cid){
		var colorList = [
			'#A6DB11', 
			'#F03A83', 
			'#FBB145', 
			'#43DAE9', 
			'#00ab28', 
			'#800080', 
			'#1e90ff', 
			'#ff8c00', 
			'#ffd700', 
			'#ff0000', 
			'#0000ff'
		];
		return colorList[(+cid || 0) % colorList.length]
	},

	onFuckingScroll: function (evt) {
		//console.log(evt)
		var $me = this;
		if(evt.detail.deltaY > 0){ //向上滑动
			$me.data.pageSszjBox.setSlideInOut(0);
		}else if(evt.detail.deltaY < -10){//向下滑动
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