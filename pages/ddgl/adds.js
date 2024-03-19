// 采购主页
import * as Xsp from "../../utils/plus.js";

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		paytypeIndex: 0,
		paytypeList: [{id:1,name:"现付"},{id:2,name:"到付"}/*,{id:3,name:"先票后付"}*/],

		carIndex:-1,
		carList:[],
		carInputNo:"",

		driverIndex:-1,
		driverList:[],

		fhfInfos:{},//发货方信息

		shfInfos:{},//收货方信息

		errorMsg:"",
		isAjaxing:false,

		form_remark:"", //备注
		form_payDays:"",//账期
		form_totalPrice:0,
		form_goodsList:[] /* [{
			"countMode": 0,
			"goodsCategoryId": 0,
			"goodsId": 0,
			"quantity": 0,
			"totalPrice": 0,
			"unitDesc": "",
			"unitPrice": 0,
			"volume": 0,
			"weight": 0
		}] */
	},
	resetData:function(){
		this.setData({
			paytypeIndex:	0,
			carInputNo:		"",
			carIndex:		-1,
			driverIndex:	-1,
			//fhfInfos:		{}, //不清理
			//shfInfos:		{}, //不清理
			errorMsg:		"",
			form_remark:	"",
			form_payDays:	"",
			form_totalPrice:0,
			form_goodsList:	[] 
		});
	},
	onPaytypeChanged: function(e){
		this.setData({
			paytypeIndex: +e.detail.value
		});
	},
	onCarChanged:function(e){
		var nth = (+e.detail.value || 0);
		if(nth >= 0){
			this.setData({
				carIndex: nth,
				carInputNo: this.data.carList[nth].carNo
			});
		}
	},
	onDriverChanged:function(e){
		var nth = (+e.detail.value || 0);
		if(nth >= 0){
			this.setData({
				driverIndex: +e.detail.value
			});
			this.getCarByDriver();
		}
	},
	gotoXdcg:function(oid){
		Xsp.gotoPage("../ddgl/succ?orderid=" + oid);
	},
	gotoTjhw:function(){
		Xsp.gotoPage("../hwgl/adds");
	},
	updateGoodsList:function(item, gindex){
		var $me = this;
		var nth = (gindex >= 0 ? gindex : $me.data.form_goodsList.length);
		$me.setData({
			[`form_goodsList[${nth}]`]: item,
		});
		$me.calcTotalPrice();
	},
	getCarByDriver: function(){
		var $me = this;
		var item = $me.data.driverList[$me.data.driverIndex];

		if(item.carId){
			$me.setData({ carInputNo : item.carNo });
			return;
		}

		$me.setData({ carInputNo : null });
		//获取根据司机获取车辆
		Xsp.getData("rms/carlist/findCarByDriver", {"driverId": item.driverId}, function(res){
			if(res && res.length){
				item["carId"] = res[0].cid || 0;
				item["carNo"] = res[0].carNo || "";
				$me.setData({ carInputNo : item.carNo });
			}
		});
	},
	getCarIdByNo:function(){
		var clist = this.data.carList;
		var cno = this.data.carInputNo.trim();

		for(let ii = 0;ii < clist.length; ii++){
			if(clist[ii].carNo === cno){
				this.setData({ carIndex: ii });
				return clist[ii].carId;
			}
		}

		return 0;
	},
	calcTotalPrice:function(){
		var $me = this;
		var total = 0.00;

		$me.data.form_goodsList.forEach(objx => {
			total += (+objx.totalPrice);
		});

		$me.setData({
			form_totalPrice: total.toFixed(2)
		});
	},
	onGoodsItemTap:function(e){
		var $me = this;
		var $data = $me.data;
		var nth = Xsp.getArgs(e, "nth");
		var ginfos = $data.form_goodsList[nth];
		var titleText = ( ginfos.goodsName + "，" 
						+ ginfos.unitPrice + " 元 * " 
						+ ginfos.goodsVwq + " = " 
						+ ginfos.totalPrice + " 元");

		wx.showActionSheet({
			alertText: titleText,
			itemList: ["修改", "删除货物"],
			success: function(res){
				let itab = res.tapIndex;
				if(itab===0){//修改
					Xsp.gotoPage("../hwgl/adds?gindex=" + nth);
				}else if(itab===1){//删除
					var glist = $data.form_goodsList;
					glist.splice(nth, 1);
					$me.setData({ form_goodsList: glist });
					$me.calcTotalPrice();
				}
			}
		});
	},
	getGoodsInfos:function(gindex){
		return this.data.form_goodsList[gindex];
	},
	setFhfInfos(xid, xnm, did, dnm, xdz){ //!!!!其他页面有调用
		var infos = {
			xqjzID:			xid,
			xqjzName:		xnm,
			deviceID:		did,
			deviceName:		dnm,
			xqjAddress:		xdz
		};

		this.setData({ fhfInfos: infos });
	},
	setWareHoureInfos(cid, cnm, cdz, jid, jnm){ //!!!!其他页面有调用
		var infos = {
			ckID:			cid,
			ckName:			cnm,
			ckAddress:		cdz, //仓库地址
			jhbcID:			jid, //胶合板厂ID
			jhbcName:		jnm  //胶合板厂 Name
		};

		this.setData({ shfInfos: infos });
	},
	checkInputs:function(){
		var $data = this.data;
		var msg = "";

		if(!$data.fhfInfos.xqjzID){
			msg = "请选择发货人";
		}else if(!$data.shfInfos.ckID){
			msg = "请选择收货人";
		}else if(!$data.form_goodsList.length){
			msg = "请添加货物";
		}else if($data.paytypeIndex && !$data.form_payDays){
			msg = "请填写账期";
		}else if($data.driverIndex < 0){
			msg = "请选择司机";
		}else if(!$data.carInputNo.trim()){
			msg = "请选择车辆";
		}else if(this.getCarIdByNo()===0){
			msg = "无此车辆，请先添加车辆。如已添加，请下拉刷新";
		}

		if(msg){
			this.setData({ errorMsg: msg });
			setTimeout((objx) => {
				objx.setData({ errorMsg: "" });
			}, 3000, this);
		}

		return !msg;
	},
	submitCgInfo:function(){ //提交采购信息
		var $me = this;
		if(!$me.checkInputs()){
			return;
		}
		var $data = $me.data;
		wx.showModal({
			title: 		"提示",
			content: 	"确认下单",
			confirmColor:"#2e53f4",
			success:function(arg){
				if(arg.confirm){
					var post_data = {
						"carId": 				$data.carList[$data.carIndex].carId, //车辆ID
						"driverId": 			$data.driverList[$data.driverIndex].driverId, //司机ID
						"jhbAddressId": 		$data.shfInfos.ckID, //仓库ID
						"orderGoodsList": 		$data.form_goodsList, //货物列表
						"paymentdays": 			$data.form_payDays, //账期
						"paytype": 				$data.paytypeList[$data.paytypeIndex].id,//付款方式
						"receiveAddress": 		$data.shfInfos.ckAddress, 	//仓库地址
						"remark": 				$data.form_remark,//备注
						"sendAddress": 			$data.fhfInfos.xqjAddress, //旋切机地址
						"xqjMachineId": 		$data.fhfInfos.deviceID, //旋切机ID
						"xqjid": 				$data.fhfInfos.xqjzID //旋切机主ID ！！！
				  	};
				  	//console.log(post_data);return;
				  	$me.setData({ isAjaxing: true });
				 	Xsp.postData("order/orderlist/saveOrder", post_data, function(res,errcode){
						if(errcode===0){
							$me.initFsPersonInfo(true);
							$me.resetData();
							$me.gotoXdcg(res);
						}
						$me.setData({ isAjaxing: false });
				  	});
				}//点了确定
			}
		});
	},
	onClickZqXf:function(){ //点击账期现付
		wx.showToast({
		  title: "现付的不用填写账期",
		  icon: "none"
		});
	},
	onClickHwZj:function(){ //点击货物总价
		wx.showToast({
		  title: "添加货物时自动计算，无需填写",
		  icon: "none"
		});
	},
	gotoDriverSelect: function(){
		//转到司机选择页面
		Xsp.gotoPage("../sjgl/sels?nth=" + this.data.driverIndex);
	},
	gotoCarSelect: function(){
		Xsp.gotoPage("../clgl/sels?cno=" + this.data.carInputNo);
	},
	gotoXqjzSelect:function(){
		Xsp.gotoPage("../xqjz/sels?sbid=" + this.data.fhfInfos.deviceID); //设备ID
	},
	gotoCkdzSelect:function(){
		Xsp.gotoPage("../ckgl/sels?ckid=" + this.data.shfInfos.ckID);
	},
	initFsPersonInfo:function(isSave){//初始化发、收货人信息
		//获取或设置发货方信息
		var $me = this;
		if(isSave){
			//保存留待下次使用
			wx.setStorageSync("add_order_fhf_infos", JSON.stringify($me.data.fhfInfos));
			wx.setStorageSync("add_order_shf_infos", JSON.stringify($me.data.shfInfos));
		}else{
			let finfos = wx.getStorageSync("add_order_fhf_infos");
			let sinfos = wx.getStorageSync("add_order_shf_infos");

			if(finfos && sinfos){
				$me.setData({fhfInfos: JSON.parse(finfos)});
				$me.setData({shfInfos: JSON.parse(sinfos)});
			}else{
				Xsp.getOrderDeliver(function(ckinfo, jzlist){
					for(let ix = 0;ix < jzlist.length; ix++){
						if(jzlist[ix].devices.length){//找到有设备的机主为止！
							$me.setFhfInfos(
								jzlist[ix].id,
								jzlist[ix].name,
								jzlist[ix].devices[0].id,
								jzlist[ix].devices[0].diType,
								jzlist[ix].devices[0].diAddress
							);
							break;
						}
					}//发货人信息

					if(ckinfo.jhbAddresses.length){
						$me.setWareHoureInfos(
							ckinfo.jhbAddresses[0].jaid,
							ckinfo.jhbAddresses[0].warehouseName,
							ckinfo.jhbAddresses[0].address,
							ckinfo.plywoodCode, //企业ID
							ckinfo.name
						);
					}//收货人、仓库信息
				});
			}
		}
	},
	getCarAndDriver: function(){
		var $me = this;
		var loadingDone = 0;

		//获取车辆列表
		Xsp.getData("rms/carlist/findCarVOPage", {"current": 1, "size": 500}, function(results){
			var clist = (results.records || []).map((infos)=>{
			  	return { "carId": infos.cid, "carNo": infos.carNo };
			});
			$me.setData({ carList: clist });

			if((++loadingDone) >= 2){
				wx.stopPullDownRefresh(); //停止下拉刷新
			}
		});

		//获取司机列表
		Xsp.getData("rms/driverlist/findDriverVOPage", {"current": 1, "size": 500}, function(results){
			var dlist = (results.records || []).map((infos)=>{
			  return { "driverId": infos.did, "driverName": infos.name + " (" + infos.phone + ")" };
			});
			$me.setData({ driverList: dlist });

			if((++loadingDone) >= 2){
				wx.stopPullDownRefresh(); //停止下拉刷新
			}
		});
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var $me = this;
		wx.hideTabBar({ animation: false }); //隐藏小程序自带的底部栏

		$me.initFsPersonInfo(false);
		
		$me.getCarAndDriver();
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
		var $me = this;
		try {
			let jsonstr = wx.getStorageSync("buying_goods_infos")
			if(jsonstr){
				let buyings = JSON.parse(jsonstr);
				$me.setData({
					fhfInfos: buyings.fhf,
					form_goodsList: buyings.goods,
					form_totalPrice: buyings.goods[0].totalPrice
				});
				wx.removeStorageSync("buying_goods_infos");
			}
		} catch (ex) {
			wx.showToast({
				title: ex.toString(),
				duration: 2000, 
				icon: "none"
			});
		}
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
		this.getCarAndDriver();
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