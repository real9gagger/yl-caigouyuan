// 底部组件
Component({
	/**
	 * 组件的属性列表
	 */
	options:{
		styleIsolation: "apply-shared"
	},
	properties: {
		tabIndex:{
			type: Number,
			value: 2
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		tabBarHeight: 55
	},
	pageLifetimes:{
		show: function() {
			var $me = this;
			var app = getApp();
			if(app.globalData.bottomBarHeight){
				$me.setData({
					tabBarHeight: app.globalData.bottomBarHeight
				});
				return; //返回
			}

			var domQuery = wx.createSelectorQuery().in($me);
			domQuery.select("#page_bottom_tabbar_box").boundingClientRect();
			domQuery.exec(function(res){
				//console.log(res);
				if(res && res.length && res[0].height){
					$me.setData({
						tabBarHeight: Math.floor(res[0].height)
					});
					app.globalData.bottomBarHeight = $me.data.tabBarHeight;
				}
				//console.log(app.globalData.bottomBarHeight)
			});
		}
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		replacePage:function(url){
			wx.showLoading({
				title: "加载中",
				icon: "loading",
				duration: 1000
			});
			wx.switchTab({ url: url });
		},
		gotoTab1:function(){
			if(this.data.tabIndex != 1){
				this.replacePage("../home/home"); //采购主页
			}
		},
		gotoTab2:function(){
			if(this.data.tabIndex != 2){
				this.replacePage("../ddgl/adds"); //采购下单
			}
		},
		gotoTab3:function() {
			if(this.data.tabIndex != 3){
				this.replacePage("../home/mine"); //个人中心
			}
		}
	}
})
