//商品列表
import * as Xsp from "../../utils/plus.js";
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		categoryList:[{id: 0, name: "全部"}], //分类类别，查询用
		categoryIndex:0,
		pageIndex:1,
		queryKeywords:"",
		goodsEndate:"", //有效期至
		spCount:0,//下拉加载时，累计加载到的数据量
		spList:null,
		priceRanges: [
			{start: 0, end: 499},
			{start: 500, end: 599},
			{start: 600, end: 699},
			{start: 700, end: 799},
			{start: 800, end: 899},
			{start: 900, end: 999},
			{start: 1000, end: 1199},
			{start: 1200, end: 1499},
			{start: 1500, end: 0},
		],
		searchRanges:[],
		topHeadHeight:0,
		tabTapIndex:0
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var $me = this;
		$me.getPageData(options.spid);
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

		var domQuery = wx.createSelectorQuery().in(this);
		domQuery.select("#page_top_head_box").boundingClientRect();
		domQuery.exec(function(res){
			if(res && res[0] && res[0].height){
				$me.setData({
					topHeadHeight: Math.floor(res[0].height) + 1
				});
			}
		});
	},
	getPageData: function(spid){
		var $me = this;
		var $data = $me.data;
		var params = {
			pageNo: $data.pageIndex,
			pageSize: 20,
			publishStatus: 2
		};

		if($data.categoryIndex > 0){
			params["goodsCategoryId"] = $data.categoryList[$data.categoryIndex].id;
		}
		if($data.goodsEndate){
			params["publishTimeEnd"] = ($data.goodsEndate + " 23:59:59");
		}
		if($data.queryKeywords){
			params["keywords"] = $data.queryKeywords;
		}
		if($data.searchRanges.length){
			params["unitPriceRanges"] = $data.searchRanges;
		}

		$me.setData({spCount: -1});
		Xsp.getData("trade/supplypublish/getSupplyPageFromJhb?ak47=yes" + Xsp.toQueryParams(params)/* 小程序不支持object数组传参，因此要手动转换 */, {}, function(res) {
			if(res.records && res.records.length){
				let spreg = /^广西壮族自治区/gim;
				let spset = ($data.spList || []);
				let spgoid = (+spid || 0); //要跳转到详情页的的商品ID
				let spindex = -1;

				res.records.forEach(function(item, index) {
					let goods = (item.goodsList && item.goodsList.length ? item.goodsList[0] : {});
					spset.push({
						spID:			(item.id),
						spCode:			(item.supplyCode),
						spDesc: 		(item.description || ""), //需求描述
						endDate: 		(item.finishTime ? item.finishTime.substr(0, 10) : ""),
						spAddress: 		(item.address || "").replace(spreg, ""), //商品地址
						pubStatus: 		(item.publishStatus || 0),
						createTime:		item.createTime,
						modifyTime:		item.modifyTime,
						xqjzID:			item.xqjId,
						xqjzName:		item.xqjName,
						xqjzPhone:		item.phone,
						deviceID:		item.deviceId,
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
					if(item.id === spgoid){
						spindex = index;
					}
				});
				
				$me.setData({
					spList: spset,
					spCount: spset.length
				});

				if(spindex >= 0){
					$me.gotoSpInfo(spindex);
				}
			}else{
				if(!$data.spList){
					$me.setData({spList: []});
				}
				$me.setData({spCount: 0 });
			}
		});
	},
	onScrollBottom: function(){
		if(this.data.spCount >= 20){ //每页 20 条
			let nextIndex = this.data.pageIndex + 1;
			this.setData({pageIndex : nextIndex});
			this.getPageData();
		}else{
			this.setData({ spCount : 0 });
		}
	},
	onInputDone: function(e){
		this.setData({
			queryKeywords: e.detail.keywords,
			pageIndex: 1,
			spList: null //重置为 null ！！！
		});
		this.getPageData();
	},
	onCategorySelected: function(e){
		var cix = +e.detail.value
		if(cix >= 0){
			this.setData({
				categoryIndex: cix,
				pageIndex: 1,
				spList: null //重置为 null ！！！
			});
			this.getPageData();
		}
		this.showHideCategoryBox();
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
				spList: null //重置为 null ！！！
			});
			this.getPageData();
		}
		this.showHideEndateBox();

	},
	gotoSpInfo: function(nth){
		try {
			wx.setStorageSync("the_sp_infos", JSON.stringify(this.data.spList[nth]));//暂时保存在本地存储里
			Xsp.gotoPage("../spgl/info");
		} catch (ex) {
			wx.showToast({
				title: ex.toString(),
				duration: 2000, 
				icon: "none"
			});
		}
	},
	onItemTap: function(e) {
		this.gotoSpInfo(Xsp.getArgs(e, "nth"));
	},
	showHideRangesBox: function() {
		this.setData({
			tabTapIndex: (this.data.tabTapIndex===3?0:3)
		});
	},
	showHideEndateBox: function(){
		this.setData({
			tabTapIndex: (this.data.tabTapIndex===2?0:2)
		});
	},
	showHideCategoryBox: function(){
		this.setData({
			tabTapIndex: (this.data.tabTapIndex===1?0:1)
		});
	},
	onPriceSelected: function(evt){
		var ranges = (evt.detail || []).map(item => {
			return {minPrice: item.min, maxPrice: item.max}
		})

		this.setData({
			pageIndex: 1,
			spList: null, //重置为 null ！！！
			searchRanges: ranges
		});

		this.showHideRangesBox();
		this.getPageData();
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
		try {
			wx.removeStorageSync("the_sp_infos");
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