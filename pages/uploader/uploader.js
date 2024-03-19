import * as Xsp from "../../utils/plus.js";
import imageUploader from "../../utils/uploader.js";
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		picID: 0,
		picGUID: "",
		picTips: "",
		picKey: "",
		isNewPic: false,
		picBaseUrl: Xsp.globalvars.PIC_BASE_URL,
		uploadProgress: 0, //上传进度
		uploadTimerID: 0,
		uploadErrMsg: ""
	},

	choosePic:function(){ //选择图片
		let $me = this;
		wx.chooseImage({
		 	count: 1,
		 	success:function(res){
				//console.log(res);
				let imgs = res.tempFilePaths;
				if(imgs && imgs.length){
					$me.startUploadPic(imgs[0], res.tempFiles[0].size);
				}
		 	},
		 	fail:function(){
				//console.log(arguments);
				//wx.showToast({
				//	title: "已取消选择图片",
				//  duration: 500,
				//  icon: "none"
		 		//});
		 	}
		});
	},
	previewPic:function(){ //预览图片
		let $data = this.data;
		let pics = [$data.picBaseUrl + $data.picID];
		wx.previewImage({
		  urls: pics,
		  current: pics[0]
		});
	},
	startUploadPic:function(img, size){ //开始上传图片
		let $me = this;

		$me.setData({
			picID: 1, //1-表示正在上传
			picGUID: ""
		});
		$me.clacProgress(size);
		imageUploader(img).then(res=>{
			$me.setData({ picID: 3 });
			clearInterval($me.uploadTimerID);
			setTimeout(function() {
				let finfos = res.data.upFileList[0];
				$me.setData({
					picID: finfos.userFileId,
					picGUID: finfos.userFileGuid,
					isNewPic: true
				});
			}, 500);
		}).catch(err=>{
			$me.setData({
				picID: 2, //2-表示上传失败 
				picGUID: "",
				isNewPic: false,
				uploadErrMsg: (err.message || "")
			});
			clearInterval($me.uploadTimerID);
		});
	},
	deletePic:function(){
		let $me = this;
		wx.showModal({
			title: "提示",
			content: "删除图片",
			cancelColor: "#999",
			confirmColor: "#f00",
			success: (res) => {
				if(res.confirm){
					$me.setData({ picID: 0, picGUID: "", isNewPic: false });
					$me.onFuckDone();
				}
			}
		});
	},
	onTapingPic:function(){ //点击图片
		let $me = this;
		let $data = $me.data;

		if($data.picID === 0 || $data.picID === 2){ //上传文件
			$me.choosePic();
		}else if($data.picID === 1){ //正在上传，请耐心等待...
			//nothing to do...
		}else{
			if($data.isNewPic){
				$me.choosePic();
			}else{
				$me.previewPic();
			}
		}
	},
	onFuckDone: function(){
		var $data =  this.data;
		Xsp.getPrevPage().onUploadDone($data.picID, $data.picGUID, $data.picKey);
		wx.navigateBack();
	},
	clacProgress(fsize){/* 【欺骗模式】，不是真实的上传进度！！！随机上传进度 */
        var $me = this;
        var seconds = Math.ceil(fsize / (500 * 1024));//假设平均上传速度 500kb/秒，预计 几秒 后完成上传
        var steps = (100 / seconds);
		var times = 0;

		clearInterval($me.uploadTimerID);

		var tid = setInterval(function(){
          if(seconds <= 1){
			$me.setData({uploadProgress: 99}); //如果图片还没上传完，让他卡在 99%
            clearInterval($me.uploadTimerID);
          }else{
			seconds--;
			$me.setData({ uploadProgress: $me.calcRandom(times * steps, steps) }); //区间内的一个随机数，让下载进度显得真实点
          }
          times++;
		}, 1000);
		
		$me.setData({
			uploadProgress: 0,
			uploadTimerID: tid
		});

        return;
	},
	calcRandom(min, len){//计算随机数【0-100的整数】
        return Math.round(Math.random() * len + min);
    },
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		if(options.title){
			wx.setNavigationBarTitle({
				title: options.title
			});
		}

		this.setData({
			picID: (+options.pid || 0), //1922
			picGUID: (options.guid || ""), //51702a03841142ff84a646ad1c357c16
			picKey: (options.pkey || ""),
			picTips: (options.tips || "请上传图片")
		});

		if(this.data.picID){
			this.previewPic();
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