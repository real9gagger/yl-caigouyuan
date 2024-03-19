// 需求列表
import * as Xsp from "../../utils/plus.js";
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		addBtnTimerID:0,
		isScrolling:false, //是否正在滚动页面
		xqList:null, //需求列表，数组
		xqCount:0, //下拉加载时，累计加载到的数据量
		pageIndex:1,
		categoryList:[{id: 0, name: "全部"}], //分类类别，查询用
		categoryIndex:0,
		statusList:[
			{code: 0, label: "全部"},
			{code: 1, label: "未发布"},
			{code: 2, label: "已发布"},
			{code: 3, label: "已结束"}
		], //发布状态，查询用
		statusIndex:0,
		goodsEndate:"", //有效期至
		queryKeywords:"",//查询关键字
		isNeedReload:false, //是否需要重新加载
		tabTapIndex: 0,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var $me = this;
		$me.getPageData();
		Xsp.getData("order/ordergoods/getGoodsCategoryList", {isEnableAjaxCache: true}, function(res){
			var categories = [{id: 0, name: "全部"}];
			(res || []).forEach(function(item){
				categories.push({"id": item.categoryId, "name": item.categoryName});
			});
			$me.setData({
				categoryList: categories,
				categoryIndex: 0
			});
		});
	},
	getPageData: function(){
		var $me = this;
		var $data = $me.data;
		var params = {
			pageNo: 	$data.pageIndex,
			pageSize:	20
		};

		if($data.categoryIndex > 0){
			params["goodsCategoryId"] = $data.categoryList[$data.categoryIndex].id;
		}
		if($data.statusIndex > 0){
			params["publishStatus"] = $data.statusList[$data.statusIndex].code;
		}
		if($data.goodsEndate){
			params["publishTimeEnd"] = ($data.goodsEndate + " 23:59:59");
		}
		if($data.queryKeywords){
			params["keywords"] = $data.queryKeywords;
		}

		$me.setData({xqCount: -1});
		Xsp.getData("trade/requirementpublish/getRequirementPageFromJhb", params, function(res) {
			if(res.records && res.records.length){
				let xqreg = /^广西壮族自治区/gim;
				let xqset = ($data.xqList || []);
				res.records.forEach(function(item) {
					let goods = (item.goodsList && item.goodsList.length ? item.goodsList[0] : {});
					xqset.push({
						xqID:			(item.id),
						xqCode:			(item.requirementCode),
						xqDesc: 		(item.description || ""), //需求描述
						endDate: 		(item.finishTime ? item.finishTime.substr(0, 10) : ""),
						ckAddress: 		(item.address || "").replace(xqreg, ""),
						ckID:			(item.addressId || 0), //仓库ID
						pubStatus: 		(item.publishStatus || 0),
						createTime:		item.createTime,
						modifyTime:		item.modifyTime,
						jhbcID:			item.jhbId, //胶合板厂ID
						jhbcName:		item.jhbName,
						jhbcPhone:		item.phone,
						goodsXID:		(goods.id || 0), //区别于货物ID。这个是货物项ID
						goodsCgID:		(goods.categoryId || 0),
						goodsGsID:		(goods.goodsId || 0),
						goodsCategory:	(goods.goodsCategoryName || "某分类"),
						goodsName: 		(goods.goodsName || "某货物"),
						goodsNums: 		(goods.volume || 0),
						goodsDesc:		(goods.description || ""),
						unitPrice: 		(goods.unitPrice || 0).toFixed(2),
						totalPrice: 	(goods.totalPrice || 0).toFixed(2),
						picList:		(goods.files || [])
					});
				});
				$me.setData({
					xqList: xqset,
					xqCount: xqset.length
				});
			}else{
				if(!$data.xqList){
					$me.setData({xqList: []});
				}
				$me.setData({xqCount: 0 });
			}
		});
	},
	onInputDone: function(e){
		this.setData({
			queryKeywords: e.detail.keywords,
			pageIndex: 1,
			xqList: null //重置为 null ！！！
		});
		this.getPageData();
	},
	addCgXq: function(){//添加新采购需求
		Xsp.gotoPage("../xqgl/adds");
	},
	onStatusSelected: function(e){
		var cix = +e.detail.value;
		if(cix >= 0){
			this.setData({
				statusIndex: +e.detail.value,
				pageIndex: 1,
				tabTapIndex: 0,
				xqList: null //重置为 null ！！！
			});
			this.getPageData();
		}else{
			this.setData({ tabTapIndex: 0 });
		}
	},
	onCategorySelected: function(e){
		var cix = +e.detail.value;
		if(cix >= 0){
			this.setData({
				categoryIndex: +e.detail.value,
				pageIndex: 1,
				tabTapIndex: 0,
				xqList: null //重置为 null ！！！
			});
			this.getPageData();
		}else{
			this.setData({ tabTapIndex: 0 });
		}
	},
	onScrollBottom: function(){
		if(this.data.xqCount >= 20){ //每页 20 条
			let nextIndex = this.data.pageIndex + 1;
			this.setData({pageIndex : nextIndex});
			this.getPageData();
		}else{
			this.setData({ xqCount : 0 });
		}
	},
	onEndateChange: function(evt) {//确定设置有效期

		var needload = true;
		if(evt.type === "cancel"){//取消设置有效期
			if(!this.data.goodsEndate){
				needload = false; //日期没有变化不需要重新加载
			}
			this.setData({ goodsEndate:"" });
		}

		if(needload){
			this.setData({
				pageIndex: 1,
				tabTapIndex: 0,
				xqList: null //重置为 null ！！！
			});
			this.getPageData();
		}else{
			this.setData({
				tabTapIndex: 0
			});
		}
	},
	gotoXqInfo:function(e){//显示需求详情
		var nth = Xsp.getArgs(e, "nth");
		try {
			wx.setStorageSync("the_xq_infos", JSON.stringify(this.data.xqList[nth]));//暂时保存在本地存储里
			Xsp.gotoPage("../xqgl/details");
		} catch (ex) {
			wx.showToast({
				title: ex.toString(),
				duration: 2000, 
				icon: "none"
			});
		}
	},
	setNeedReload:function() {
		this.setData({
			isNeedReload: true
		});
	},
	setTabTapIndex(evt){
		this.setData({
			tabTapIndex: +Xsp.getArgs(evt, "tindex")
		})
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

		$me.setData({
			isScrolling: true,
			addBtnTimerID: timerID
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
		if(this.data.isNeedReload){
			this.setData({
				xqList: null,
				isNeedReload: false
			});
			this.getPageData();
		}
		try {
			wx.removeStorageSync("the_xq_infos");
		} catch (ex) {}
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