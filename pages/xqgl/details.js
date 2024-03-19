import * as Xsp from "../../utils/plus.js";
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		xqInfos: {},
		xqPicUrl: Xsp.globalvars.PIC_BASE_URL,
		isDeleting: false //是否正在提交终止请求
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		try{
			this.setData({
				xqInfos: JSON.parse(wx.getStorageSync("the_xq_infos"))
			});
			//console.log(this.data.xqInfos);
		}catch(ex){
			wx.showToast({
				title: ex.toString(),
				duration: 2000, 
				icon: "none"
			});
		}
	},
	previewXqPics: function (evt) {//预览照片
		let $data = this.data;
		let files = $data.xqInfos.picList;
		let pics = [];
		let nth = +Xsp.getArgs(evt, "nth");

		for(let i = 0; i < files.length; i++){
			pics.push($data.xqPicUrl + files[i].fileId);
		}

		wx.previewImage({
		  urls: pics,
		  current: pics[nth]
		});
	},
	gotoAdds: function() {
		Xsp.gotoPage("../xqgl/adds?is_edit=1");
	},
	deleteXq: function() {//终止需求
		var $me = this;
		var $data = this.data;
		if($data.isDeleting){
			return;
		}

		wx.showModal({
			title: 		"提示",
			content: 	"确认终止？",
			confirmColor:"#ff0000",
			success:function(arg){
				if(arg.confirm){
					$me.setData({ isDeleting: true });
					Xsp.postData("trade/requirementpublish/invalidRequirement/" + $data.xqInfos.xqID, {}, function(res, code) {
						if(code===0){
							wx.showToast({ 
								title: "已终止",
								duration: 2000, 
								icon: "none"
							});
							Xsp.getPrevPage().setNeedReload();
							setTimeout(function(){ wx.navigateBack() }, 500);
						}else{
							$me.setData({ isDeleting: false });
						}
					});
				}
			}
		})
	},
	callJhbc: function(){ //打电话给旋切机主
		wx.makePhoneCall({
		  phoneNumber: this.data.xqInfos.jhbcPhone
		});
	},
	seeAddress: function(){//查看备注/描述
		var text = this.data.xqInfos.ckAddress;
		if(text){
			wx.showModal({
				title: 		"仓库地址",
				content: 	text,
				showCancel: false,
				confirmColor:"#000"
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

	}
})