// 商品详情
import * as Xsp from "../../utils/plus.js";
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		spInfos: {},
		deviceInfos: null,
		spPicUrl: Xsp.globalvars.PIC_BASE_URL,
		isAjaxing: false,
		recommendGoods: [] //推荐商品
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var $me = this;

		try{
			$me.setData({
				spInfos: JSON.parse(wx.getStorageSync("the_sp_infos"))
			});
		}catch(ex){
			wx.showToast({
				title: ex.toString(),
				duration: 2000, 
				icon: "none"
			});
		}

		//获取推荐的商品
		Xsp.getData("trade/supplypublish/findRecommendSupplyPage", {
			pageNo: 1,
			pageSize: 10,
			supplyId: $me.data.spInfos.spID
		} , function(res) {
			let spreg = /^广西壮族自治区/gim;
			let spset = [];

			(res.records || []).forEach(function(item) {
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
			});

			$me.setData({ recommendGoods: spset });
		});

		$me.gotoMaper();
	},

	previewSpPics: function (evt) {//预览照片
		let $data = this.data;
		let files = $data.spInfos.picList;
		let pics = [];
		let nth = +Xsp.getArgs(evt, "nth");

		for(let i = 0; i < files.length; i++){
			pics.push($data.spPicUrl + files[i].fileId);
		}

		wx.previewImage({
		  urls: pics,
		  current: pics[nth]
		});
	},
	callXqjz: function(){ //打电话给旋切机主
		wx.makePhoneCall({
		  phoneNumber: this.data.spInfos.xqjzPhone
		});
	},
	buyTheGoods: function() { //购买此商品
		var infos = this.data.spInfos;
		var objx = {
			fhf:{ //发货方
				"xqjzID":			infos.xqjzID,
				"xqjzName":			infos.xqjzName,
				"deviceID":			infos.deviceID,
				"deviceName":		"",
				"xqjAddress":		infos.spAddress
			},
			/*shf:{ //收货方
				"ckID":				"",
				"ckName":			"",
				"ckAddress":		"", //仓库地址
				"jhbcID":			"", //胶合板厂ID
				"jhbcName":			""  //胶合板厂 Name
			},*/
			goods:[{ //商品
				"countMode": 		1, //按体积计算
				"goodsCategoryId": 	infos.goodsCgID,
				"goodsId": 			infos.goodsGsID,
				"goodsName":		infos.goodsCategory + " " + infos.goodsName,
				"goodsVwq":			infos.goodsNums + " 方",
				"quantity": 		0,
				"totalPrice": 		+infos.totalPrice,
				"unitDesc": 		infos.goodsDesc,
				"unitPrice": 		+infos.unitPrice,
				"volume": 			infos.goodsNums,
				"weight":			0
			}]
		}
		try {
			wx.setStorageSync("buying_goods_infos", JSON.stringify(objx));
			wx.showLoading({
				title: "加载中",
				icon: "loading",
				duration: 500
			});
			setTimeout(function(){
				Xsp.gotoPage("../ddgl/adds", 2);
			}, 500);
		} catch (ex) {
			wx.showToast({
				title: ex.toString(),
				duration: 2000, 
				icon: "none"
			});
		}
	},
	gotoMaper: function() {
		var $me = this;
		var dis = $me.data.deviceInfos;
		if(dis){
			Xsp.gotoPage(`../maper/maper?lat=${dis.diLat}&lng=${dis.diLon}&address=${dis.diAddress}`)
		}else if(!$me.data.isAjaxing){
			$me.setData({isAjaxing: true});

			let params = {
				deviceIds: $me.data.spInfos.deviceID.toString()
			};
			Xsp.getData("rms/rotarycutteruser/getXqjDeviceInfoByIds", params, function(res) {
				if(res && res.length){
					dis = res[0];
					dis.mapMarker = [{
						id: 708090,
						latitude: dis.diLat,
						longitude: dis.diLon,
						iconPath: "../../images/map_pin.png",
						height: 30,
						width: 30,
						zIndex: 99
					}];
					$me.setData({ deviceInfos: dis });
				}
				$me.setData({isAjaxing: false});
			});
		}
	},
	seeRecommend: function(evt) {
		var nth = Xsp.getArgs(evt, "nth");
		try {
			wx.setStorageSync("the_sp_infos", JSON.stringify(this.data.recommendGoods[nth]));//暂时保存在本地存储里
			Xsp.gotoPage("../spgl/info", 1);
		} catch (ex) {
			wx.showToast({
				title: ex.toString(),
				duration: 2000, 
				icon: "none"
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
		/*var infos = this.data.spInfos;
		if(infos.picList.length){
			return {
				title: infos.goodsCategory + " 单板",
				path: "../spgl/list",
				imageUrl: this.data.spPicUrl + infos[0].fileId
			}
		}*/
	}
})