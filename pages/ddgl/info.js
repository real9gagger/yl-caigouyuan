// 订单详情页
import * as Xsp from "../../utils/plus.js";
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		orderID:0,
		orderInfos:null,
		trackPoints:[], //车辆轨迹经纬度
		trackMarkers:[], //车辆轨迹起始点标记
		imgURL: Xsp.globalvars.PIC_BASE_URL
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var $me = this;
		$me.setData({
			orderID: (options.orderid || 417)
		});

		Xsp.getData("order/orderlist/getOrderDetail", {"orderId" : $me.data.orderID}, function(res){
			//console.log(res)
			if(res){
				let sePoints = [];
				let seMarkers = [];
				if(!res.loadtime){
					res.loadtime = "-";
				}
				if(!res.unloadtime){
					res.unloadtime = "-";
				}
				if(!res.warndesc){
					res.warndesc = "-";
				}
				if(!res.remark){
					res.remark = "-";
				}
				if(res.loadlong && res.loadlat){ //装车地点经纬度
					sePoints.push({
						latitude: res.loadlat, 
						longitude: res.loadlong
					});
					seMarkers.push({
						id: 1,
						title: "起点",
						zIndex: 10,
						width: 26,
						height: 28,
						latitude: res.loadlat, 
						longitude: res.loadlong,
						iconPath: "../../images/map_start_marker.png"
					});
				}
				if(res.unloadlong && res.unloadlat){ //卸货地点经纬度
					sePoints.push({
						latitude: res.unloadlat, 
						longitude: res.unloadlong
					});
					seMarkers.push({
						id: 2,
						title: "终点",
						zIndex: 10,
						width: 26,
						height: 28,
						latitude: res.unloadlat, 
						longitude: res.unloadlong,
						iconPath: "../../images/map_end_marker.png"
					});
				}
				res.deviceAddress 		= $me.getShortAddress(res.deviceAddress, "-");
				res.receiveAddress 		= $me.getShortAddress(res.receiveAddress, "-");
				res.paymentdays 		= (res.paytype==1 ? "现结" : res.paymentdays + "天")
				res.paytype 			= $me.getPayTypeText(res.paytype);
				res.totalprice 			= (res.totalprice || 0).toFixed(2);
				res.orderStatus 		= $me.getOrderStatusText(res.orderStatus);
				
				$me.setData({ 
					orderInfos: res,
					trackPoints: [{
						//各个参数意思，参见 https://developers.weixin.qq.com/miniprogram/dev/component/map.html
						color: "#1ba4f0",
						width: 8,
						arrowLine: true,
						points: sePoints
					}],
					trackMarkers: seMarkers
				});
			}else{
				$me.setData({ orderInfos: {} });
			}
		});
	},
	getOrderStatusText: function(code){
    	switch(code){
    	  case 10: return "新建";
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
	getShortAddress: function(address, defval){
		if(!address){
			return defval;
		}
		return address.replace(/^广西(壮族自治区)?/g, "");
	},
	getPayTypeText: function(code){
        switch(code){
          case 1: return "现金";
          case 2: return "到付";
          case 3: return "先票后款";
          default: return code;
        }
	},
	seeOrderWarndesc: function(){
		var desc = this.data.orderInfos.warndesc;
		if(desc && desc !== "-"){
			wx.showModal({
				title: 		"订单校验结果",
				content: 	desc,
				showCancel: false,
				confirmColor:"#000"
			});
		}
	},
	seeOrderRemark: function(){
		var text = this.data.orderInfos.remark;
		if(text && text !== "-"){
			wx.showModal({
				title: 		"订单备注",
				content: 	text,
				showCancel: false,
				confirmColor:"#000"
			});
		}
	},
	previewOrderPics(evt){ //预览订单照片
		let $data = this.data;
		let files = $data.orderInfos.files;
		let pics = [];
		let nth = +Xsp.getArgs(evt, "nth");

		for(let i = 0; i < files.length; i++){
			pics.push($data.imgURL + files[i].fileid);
		}

		wx.previewImage({
		  urls: pics,
		  current: pics[nth]
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