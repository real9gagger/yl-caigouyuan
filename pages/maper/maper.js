//地图，选择位置
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk = new QQMapWX({ 
	key: "W57BZ-JDB6X-XPA4H-Z76MI-73FF2-24BT4"
});

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		mapLat:22.0, //当前Pin图标所在的纬度，地图中心 纬度
		mapLng:108.0, //当前Pin图标所在的经度，地图中心 经度
		mapAddress:"", //地点详细地址
		mapPlace:"", //地点名称，如 XXX小区，XXX大厦

		mapGeocoding:true,//是否正在获取位置信息
		mapPinUpDowning:false,
		mapPinTimerID:0,
		mapPoisList: [], //Pin图标附近的性趣点
		mapPoisIndex: 0, //选中的那一个

		isViewMode: false, //查看模式，非选择模式
		isGetGeocoder: false,
		mapWrapHeight: 60,
		scrollInfos:{
			scrollTop: 0,
			startX: 0,
			startY: 0
		},
		searchInputTimerID: 0,
		seachInputKeyword: ""
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var $me = this;
		if(+options.lat && +options.lng){
			$me.setData({
				mapAddress: options.address,
				mapLat: 	options.lat,
				mapLng:		options.lng,
				isViewMode: true
			});
			$me.getLnglatDetails({ 
				"latitude" : options.lat, 
				"longitude": options.lng 
			});
		}else if(options.address){
			//根据地址获得经纬度
			//参见 https://lbs.qq.com/miniProgram/jsSdk/jsSdkGuide/methodGeocoder
			qqmapsdk.geocoder({
				"address": options.address,
				"success": function(res, data){
					var infos = res && res.result;
					if(infos && infos.location){
						$me.setData({
							mapAddress: options.address,
							mapLat: 	infos.location.lat,
							mapLng:		infos.location.lng,
							isViewMode: (options.isview==1)
						});

						$me.getLnglatDetails({ 
							"latitude" : infos.location.lat, 
							"longitude": infos.location.lng 
						});
					}
				},
				"fail": function(err){ //地址解析失败
					$me.setData({ mapGeocoding: false });
					wx.showToast({
						title: err.message,
						icon: "none"
					});
				}
			});
		}else{
			wx.getLocation({
				type:"gcj02",
				isHighAccuracy:true,
			  	success:function(res){
					$me.setData({
						mapLat: res.latitude,
						mapLng: res.longitude
					});
					$me.getLnglatDetails({ 
        	            "latitude" : res.latitude, 
        	            "longitude": res.longitude 
        	        }); 
				},
				fail: function(err){
					$me.setData({ mapGeocoding: false });
					wx.showToast({
						title: "定位失败",
						icon: "none"
					});
				}
			});
		}
	},
	//  ==============================================================================
	mapPinUpDown: function(evt){
		if(evt.type !== "end"){
			return false;
		}
		//console.log(evt);

		let $me = this;
		clearTimeout($me.data.mapPinTimerID);
		let tid = setTimeout(function(){
			$me.setData({ mapPinUpDowning: true });
			setTimeout(() => { $me.setData({ mapPinUpDowning:false }) }, 1000);
			if($me.data.isGetGeocoder){
				$me.getLnglatDetails(evt.detail.centerLocation);
			} else {
				$me.setData({isGetGeocoder: true});
			}
		}, 500);
		$me.setData({mapPinTimerID: tid});

		return true;
	},
	poisItemTap: function(evt){
		var nth = evt.currentTarget.dataset["nth"];
		var poix = this.data.mapPoisList[nth];

		this.setData({
			mapLat: poix.lat,
			mapLng: poix.lng,
			mapAddress: poix.address,
			mapPlace: poix.title,

			mapPoisIndex: nth,
			isGetGeocoder: false
		});
	},
	getLnglatDetails: function(latlng){
		var $me = this;
		$me.setData({ 
			mapGeocoding: true,
			mapPoisIndex: 0
		});
		qqmapsdk.reverseGeocoder({
			location: latlng,
			get_poi: 1,
			poi_options: "radius=5000;page_size=20;page_index=1",
			success: function(res){
				//console.log(res);
				let infos = (res.result || {});
				let placeName = "";
				try{
					placeName = (infos.address_reference ? infos.address_reference.landmark_l2.title : "");
					if(!placeName){
						placeName = (infos.formatted_addresses ? infos.formatted_addresses.recommend : "");
						placeName = (placeName ? placeName.replace(/\(.+?\)$/, "") : ""); //去掉结尾括号内的内容
					}
				}catch(ex){
					console.log(ex);
				}
				
				let poiss = (infos.pois || []).map(function(vxo) {
					return {
						"address": 	vxo.address.replace(/^广西壮族自治区/, ""),
						"title": 	vxo.title,
						"distance": $me.getDisText(vxo._distance),
						"lng": 		(vxo.location.lng || 1),
						"lat": 		(vxo.location.lat || 1)
					}
				});

				$me.setData({
					mapAddress: infos.address.replace(/^广西壮族自治区/, ""),
					//mapLat: 	infos.location.lat,
					//mapLng:	infos.location.lng,
					mapPlace:	placeName,
					mapGeocoding: false,
					mapPoisList: poiss //性趣点
				});
			},
			fail: function (err) {
				$me.setData({ mapGeocoding: false });
				wx.showModal({
					title: 		"提示",
					content: 	"获取附近地点失败：" + err.message,
					showCancel: false,
					confirmColor: "#000"
				});
			}
		});
		return 1;
	},
	mapAddressDone: function(){
		let pages = getCurrentPages();
		let arg0 = this.data.mapAddress;
		let arg1 = this.data.mapLng;
		let arg2 = this.data.mapLat;

		if(this.data.mapPlace){
			arg0 = (this.data.mapPlace + " (" + arg0 + ")");
		}

		pages[pages.length - 2].setFormattedAdrress(arg0, arg1, arg2);
		wx.navigateBack();
	},
	onBottomTouchXxoo: function(evt){
		var etype = evt.type;
		var $me = this;
		var $sinfo = $me.data.scrollInfos;
		//console.log(evt)
		if(etype==="touchstart"){
			let tsxo = evt.touches;
			if(tsxo && tsxo.length===1 && $sinfo.scrollTop===0){
				$me.setData({
					["scrollInfos.startX"]: tsxo[0].clientX,
					["scrollInfos.startY"]: tsxo[0].clientY,
				});
			}else{
				$me.setData({
					["scrollInfos.startX"]: 0,
					["scrollInfos.startY"]: 0,
				});
			}
		}else if(etype==="touchmove"){
			let tsxo = evt.touches;			
			if($sinfo.startX > 0 && tsxo && tsxo.length===1){
				let endX = tsxo[0].clientX;
				let endY = tsxo[0].clientY;
				let disY = Math.abs(endY - $sinfo.startY);
				let angleS = $me.calcAngle($sinfo.startX, $sinfo.startY, endX, endY);
				if(angleS <= -60 && angleS >= -120){ //向下滑动
					if(disY > 10){
						this.setData({ mapWrapHeight: 60 });
					}
				}else if(angleS >= 60 && angleS <= 120){//向上滑动
					if(disY > 10){
						this.setData({ mapWrapHeight: 30 });
					}
				}
			}
		}else if(etype==="scroll"){
			let tsxo = evt.detail;
			if(tsxo){
				$me.setData({
					["scrollInfos.scrollTop"]: Math.floor(tsxo.scrollTop || 0)
				});
			}else{
				$me.setData({
					["scrollInfos.scrollTop"]: 0
				});
			}
		}
	},
	calcAngle: function(x0,y0,x1,y1){
		//向上滑动-正数，向下为负数
		return -Math.atan2(y1 - y0 , x1 - x0) / Math.PI * 180;
	},
	getDisText:function(dsx) {
		if(!dsx || dsx <= 0){
			return "附近"
		}else if(dsx < 1000){
			return dsx.toFixed(0) + "m";
		}else{
			return (dsx / 1000).toFixed(1) + "km";
		}
	},
	onSearchPlace: function(evt){
		var inputstr = evt.detail.value.trim();
		var $me = this;
		clearTimeout($me.data.searchInputTimerID);

		if($me.data.seachInputKeyword === inputstr){
			return;
		}else{
			$me.setData({seachInputKeyword: inputstr});
		}

		if(!inputstr){
			$me.getLnglatDetails({ 
				"latitude" : $me.data.mapLat,
				"longitude": $me.data.mapLng
			});
			return;
		}

		let tid = setTimeout(function() {
			$me.setData({ 
				mapGeocoding: true,
				mapPoisIndex: -1
			});

			qqmapsdk.getSuggestion({//使用 qqmapsdk.search 得到的结果较少
				"keyword": inputstr,
				"page_size": 20,
				"page_index": 1,
				"location": ($me.data.mapLat + "," + $me.data.mapLng),
				"success": function(res) {
					let infos = (res || {});
					let poiss = (infos.data || []).map(function(vxo) {
						return {
							"address": 	vxo.address.replace(/^广西壮族自治区/, "广西"),
							"title": 	vxo.title,
							"distance": $me.getDisText(vxo._distance),
							"lng": 		(vxo.location.lng || 1),
							"lat": 		(vxo.location.lat || 1)
						}
					});
	
					$me.setData({
						mapGeocoding: false,
						mapPoisList: poiss //性趣点
					});
				}
			});
		}, 1000);

		$me.setData({ searchInputTimerID: tid });
	},
	onInputFocus: function(){
		this.setData({
			mapWrapHeight: 30
		});
	},
	gotoInputer: function(){
		wx.navigateTo({ url: "inputer" });
	},
	setInputAddress: function(addrStr){
		if(!addrStr){
			return;
		}

		var newlist = (this.data.mapPoisList || []); 
		var newitem = {
			"title": addrStr,
			"distance": "未知距离",
			"address": "手动输入的地址",
			"lng":0,
			"lat":0,
		};

		if(!newlist.length){
			newlist.push(newitem);
		}else if(!newlist[newlist.length - 1].lng){ //手动输入的地址
			newlist[newlist.length - 1] = newitem;
		}else{
			newlist.push(newitem);
		}

		this.setData({
			mapPoisList: newlist,
			mapPoisIndex: newlist.length - 1,
			mapAddress: addrStr,
			mapPlace: ""
		});
	},
	/** ==============================================================================
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