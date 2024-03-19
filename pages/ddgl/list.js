// 订单列表
import * as Xsp from "../../utils/plus.js";
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		tabIndex: 1,
		orderList: null,
		todayStr:"",
		yesterdayStr:"",
		curRecordCount: -1,
		queryKeywords:"",
		pageIndex:1,
		statusList:[
			{code: 10, label:"新订单"},
			{code: 20, label:"已发车"},
			{code: 25, label:"运输中"},
			{code: 30, label:"已验收"},
			{code: 31, label:"验收不合格"},
			{code: 40, label:"已付款"},
			{code: 46, label:"开票申请中"},
			{code: 50, label:"已开票"},
			{code: 51, label:"已开票未付款"}
		],
		statusIndex: 0
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var $me = this;
		var nowdt = new Date();
		$me.setData({
			todayStr: nowdt.toJSON().substr(0, 10)
		});
		nowdt.setDate(nowdt.getDate() - 1);
		$me.setData({
			yesterdayStr: nowdt.toJSON().substr(0, 10),
		});
		$me.getOrderList();
	},
	getOrderList: function(){
		var $me = this;
		var $data = $me.data;

		var params = {
			"orderCode": 	"",
			"xqjzName": 	"",
			"status":		($data.tabIndex === 1 ? "" : $data.statusList[$data.statusIndex].code),
			"pageNo":		$data.pageIndex,
			"pageSize":		10
		};

		if($data.queryKeywords){
			if(/^\d+$/.test($data.queryKeywords)){
				params.orderCode = $data.queryKeywords;
			}else{
				params.xqjzName = $data.queryKeywords;
			}
		}

		$me.setData({
			curRecordCount: -1
		});

		Xsp.getData("order/orderlist/page", params, function(res){
			//console.log(res);
			var list = $data.orderList || [];
			var count = 0;

			(res.records || []).forEach(function(item){
				let gsls = [];

				if(item.goodsList && item.goodsList.length){
					for(let ii = 0;ii < item.goodsList.length;ii++){
						let goods = item.goodsList[ii];
						gsls.push({
							"gid": goods.gid,
							"name": (goods.categoryName + " " + goods.goodsName),
							"vwq": $me.getGoodsVwq(goods.volume, goods.weight, goods.quantity, goods.countMode),
							"desc": goods.unitDesc
						});
					}
				}

				list.push({
					"orderID":		item.orderid,
					"orderCode" : 	item.orderCode,
					"statusText": 	$me.getOrderStatusText(item.orderStatus),
					"statusColor":  $me.getOrderStatusColor(item.orderStatus),
					"driverName":	item.driverName,
					"carNo":		item.carNo,
					"createdTime":	$me.getShortTime(item.createdtime),
					"orderFrom":	item.xqjzName, //$me.getShortAddress(item.sendAddress, "未知发货地址"),
					"orderTo":		item.jhbWarehouseName || "未知仓库", //$me.getShortAddress(item.receiveAddress, "未知收货地址"),
					"goodsList":	gsls
				});
				count++;
			});

			$me.setData({
				orderList : list,
				curRecordCount : count
			});
		});
	},
	onTabTap: function(evt){
		this.setData({
			tabIndex: +Xsp.getArgs(evt, "nth"),
			pageIndex: 1,
			orderList: null
		});
		this.getOrderList();
	},
	onInputDone:function(e){
		this.setData({
			queryKeywords: e.detail.keywords,
			pageIndex: 1,
			orderList: null
		});
		this.getOrderList();
	},
	getShortTime:function(dt){
		if(!dt){
			return "";
		}else if(dt.length >= 19){
			if(dt.startsWith(this.data.todayStr)){
				return "今天" + dt.substr(10, 6);
			}else if(dt.startsWith(this.data.yesterdayStr)){
				return "昨天" + dt.substr(10, 6);
			}else{
				return dt.substr(5, 11).replace('-', '/');
			}
		}else{
			return dt;
		}
	},
	getOrderStatusText:function(code){
        switch(code){
          case 10: return "新订单";
          case 20: return "已发车";
          case 25: return "运输中";
          case 30: return "已验收";
          case 31: return "验收不合格";
          case 40: return "已付款";
          case 46: return "开票申请中";
          case 50: return "已开票";
          case 51: return "已开票未付款";
          default: return code;
        }
	},
	getOrderStatusColor:function(code){
        switch(code){
          case 10: return "#666666"; //新订单
          case 20: return "#67C23A"; //已发车
          case 25: return "#1ba4f0"; //运输中
          case 30: return "#67C23A"; //已验收
          case 31: return "#E6A23C"; //验收不合格
          case 40: return "#67C23A"; //已付款
          case 46: return "#1ba4f0"; //开票申请中
          case 50: return "#67C23A"; //已开票
          case 51: return "#1ba4f0"; //已开票未付款
          default: return "#000000";
        }
	},
	getGoodsVwq:function(v,w,q,m){//体积(v)或重量(w)或数量(q)
		switch(m){
			case 2: return ((w || 0) + " 吨");
			case 3: return ((q || 0) + " 件");
			default:return ((v || 0) + " 方");
		}
	},
	onScrollBottom:function(){
		if(this.data.curRecordCount >= 10){
			let nextIndex = this.data.pageIndex + 1;
			this.setData({pageIndex : nextIndex});
			this.getOrderList();
		}else{
			this.setData({ curRecordCount : 0 });
		}
	},
	onStatusSelected: function(e){
		this.setData({
			statusIndex: +e.detail.value,
			tabIndex: 2,
			pageIndex: 1,
			orderList: null
		});
		this.getOrderList();
	},
	gotoOrderInfos: function(evt){
		Xsp.gotoPage("../ddgl/info?orderid=" + Xsp.getArgs(evt, "oid"));
	},
	getShortAddress: function(address, defval){
		if(!address){
			return defval;
		}
		return address.replace(/^广西(壮族自治区)?/g, "");
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