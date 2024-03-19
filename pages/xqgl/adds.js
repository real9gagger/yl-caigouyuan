//新增需求
import * as Xsp from "../../utils/plus.js";
import imageUploader from "../../utils/uploader.js";
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		theXqID:0, //需求ID，用于修改需求
		categoryList: [],
		categoryIndex: -1,
		goodsXID:0,
		goodsList:[],
		goodsIndex:-1,
		goodsSpeci:"1270mm*630mm*1.5mm", //商品规格
		goodsNums:"",
		goodsPrice:"",
		goodsEndate:"", //有效期结束日期
		goodsRemark:"", //描述
		picList:[/*{
			"fileGuid": "68a1cfdbbc31480aae401a9c0994a806",
			"fileId": 	7200 //7169
		},{
			"fileGuid": "057c602cce4745f290a826ea2f2ca8d9",
			"fileId": 	7201 //7170
		}*/],
		picUrl:Xsp.globalvars.PIC_BASE_URL,
		warehouseID:0,
		warehouseName:"",
		warehouseAddress:"", //仓库地址
		jhbcID:0, //胶合板厂ID
		jhbcName:"",
		jhbcPhone:"",
		warningCode:0,
		isAjaxing:0, //0-未在提交，1-正在提交，2-提交成功
		isTaFocus:false,
		isFromHome:false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var $me = this;
		var theCategoryID = 0;
		var theGoodsID = 0;

		if(options.is_edit==1){
			try{
				let xqInfos = JSON.parse(wx.getStorageSync("the_xq_infos"));
				$me.setData({
					theXqID:		xqInfos.xqID,
					goodsXID:		xqInfos.goodsXID,
					goodsSpeci:		xqInfos.goodsDesc,
					goodsNums:		xqInfos.goodsNums,
					goodsPrice:		xqInfos.unitPrice,
					goodsEndate:	xqInfos.endDate,
					goodsRemark:	xqInfos.xqDesc,
					picList:		xqInfos.picList,
					warehouseID:	xqInfos.ckID,
					warehouseName:	xqInfos.ckAddress, //后台没有传来仓库名称，暂时用地址代替
					warehouseAddress:xqInfos.ckAddress,
					jhbcID:			xqInfos.jhbcID,
					jhbcName:		xqInfos.jhbcName,
					jhbcPhone:		xqInfos.jhbcPhone
				});
				theCategoryID = xqInfos.goodsCgID;
				theGoodsID = xqInfos.goodsGsID;
			}catch(ex){
				wx.showToast({
					title: ex.toString(),
					duration: 2000, 
					icon: "none"
				});
			}
		}

		Xsp.getData("order/ordergoods/getGoodsCategoryList", {isEnableAjaxCache: true}, function(res){
			var categories = (res || []).map(function(item){
				return {"id": item.categoryId, "name": item.categoryName};
			});
			var idx = 0;

			if(theCategoryID){
				idx = categories.findIndex((item) => (item.id===theCategoryID));
				if(idx < 0){
					idx = 0;
				}
			}

			$me.setData({
				categoryList: categories,
				categoryIndex: idx
			});
			$me.getGoodsList(idx, theGoodsID);
		});

		$me.setData({
			isFromHome: (options.from==="home")
		})
	},

	getGoodsList:function(nth, gid){
		var $me = this;
		var item = $me.data.categoryList[nth];

		$me.setData({
			goodsIndex: -1,
			categoryIndex: nth
		});
		if(item.goods){
			$me.setData({
				goodsList: item.goods,
				goodsIndex: 0
			});
		}else{
			Xsp.getData("order/ordergoods/getGoodsByCategoryId", {"categoryId": item.id, isEnableAjaxCache: true}, function(res){
				var goods = (res || []).map(function(subitem){
					return {"id": subitem.goodsId, "name": subitem.goodsName};
				});
				var idx = 0;

				if(gid){
					idx = goods.findIndex(item => (item.id===gid));
					if(idx < 0){
						idx = 0;
					}
				}

				$me.setData({
					goodsList: goods,
					goodsIndex: idx,
				});
				item.goods = goods;
			});
		}
	},
	onCategoryChanged:function(e){
		this.getGoodsList(+e.detail.value, 0);
	},
	onGoodsChanged:function(e){
		var nth = +e.detail.value;
		this.setData({
			goodsIndex: nth
		});
		var gName = this.data.goodsList[nth].name;
		var houdu = gName.match(/\d+(\.\d+)?mm$/i); //厚度
		if(houdu){
			this.setData({ goodsSpeci: "1270mm*630mm*" + houdu[0] });
		}else{
			this.setData({ goodsSpeci: "1270mm*630mm*" });
		}
	},
	chooseGoodsPic:function(nth){ //选择图片
		let $me = this;
		let startIndex = $me.data.picList.length;
		let picCount = (nth >= 0 ? 1 : (9 - startIndex)); //1：重新上传，其他：添加照片

		wx.chooseImage({
		  count: picCount, //最多 9 张
		  success:function(res){
			let imgs = res.tempFilePaths;
			if(nth >= 0){
				$me.startUploadPic(imgs[0], nth);
			}else{
				for (let jj = 0; jj < imgs.length; jj++) {
					$me.startUploadPic(imgs[jj], jj + startIndex);
				}
			}
		  },
		  fail:function(){
			//console.log(arguments);
			//wx.showToast({
			//	title: "已取消选择图片",
			//  	duration: 500,
			//  	icon: "none"
		  	//});
		  }
		});
	},
	previewGoodsPic:function(nth){ //预览图片
		let $data = this.data;
		let fset = $data.picList;
		let pics = [];

		for(let i = 0; i < fset.length; i++){
			pics.push($data.picUrl + fset[i].fileId);
		}

		wx.previewImage({
		  urls: pics,
		  current: pics[nth]
		});
	},
	startUploadPic:function(img, nth){ //开始上传图片
		let $me = this;

		$me.setData({ 
			[`picList[${nth}]`]: {
				"fileGuid": "",
				"fileId": 1 //正在上传
			}
		}); 

		imageUploader(img).then(res=>{
			let fileInfo = res.data.upFileList[0];
			$me.setData({
				[`picList[${nth}]`]: {
					"fileGuid": fileInfo.userFileGuid,
					"fileId": 	fileInfo.userFileId
				}
			});
		}).catch(res=>{
			$me.setData({ 
				[`picList[${nth}]`]: {
					"fileGuid": 	"",
					"fileId": 		0 //正在失败
				}
			}); 
		});
	},
	onTapingPic:function(evt){ //点击图片
		let $me = this;
		let $data = $me.data;
		let nthPic = +evt.currentTarget.dataset.nth;
		let fobj = $data.picList[nthPic];

		if(!fobj){ //上传文件
			$me.chooseGoodsPic(-1);
		}else if(fobj.fileId===0){ //上传失败
			wx.showActionSheet({
			  	itemList: ["重新上传", "移除"],
			  	success: function(res){
					let itab = res.tapIndex;
					if(itab===0){
						$me.chooseGoodsPic(nthPic);
					}else if(itab===1){
						$me.deleteGoodsPic(nthPic);
					}//else if
			  	}
			});
		}else if(fobj.fileId===1){ //正在上传
			//wx.showActionSheet({
			//	itemList: ["取消上传"]
			//});
		}else{ //图片ID，上传成功
			wx.showActionSheet({
				itemList: ["重新上传", "预览", "删除"],
				success: function(res){
					let itab = res.tapIndex;
					if(itab===0){
						$me.chooseGoodsPic(nthPic);
					}else if(itab===1){
						$me.previewGoodsPic(nthPic);
					}else if(itab===2){
						$me.deleteGoodsPic(nthPic);
					}//else if
				}
			});
		}
	},
	deleteGoodsPic:function(nth){ //删除图片
		let $me = this;
		wx.showModal({
			title: "提示",
			content: "确定要删除吗？",
			cancelColor: "#999",
			confirmColor: "#f00",
			success: (res) => {
				if(res.confirm){
					let $xxoo = $me.data.picList;
					$xxoo.splice(nth, 1)[0];
					$me.setData({ picList : $xxoo });
				}//if 
			}
		});
	},
	selectWareHouse:function(){
		Xsp.gotoPage("../ckgl/sels?ckid=" + this.data.warehouseID);
	},
	setWareHoureInfos:function(whid,whname,whaddress,argx,argy,argz){ //选择仓库界面有调用
		//console.log(arguments)
		this.setData({
			warehouseID: whid,
			warehouseName: whname,
			warehouseAddress: whaddress,
			jhbcID: argx,
			jhbcName: argy,
			jhbcPhone: argz
		});
	},
	onSubmitGoods:function(){
		var $me = this;
		var $data = $me.data;
		var wcode = 0;
		var title = "";
		var delta = 1;

		if($data.categoryIndex < 0){
			wcode = 1;
			title = "品名";
		}else if($data.goodsIndex < 0){
			wcode = 2;
			title = "等级";
		}else if(!$data.goodsSpeci){
			wcode = 3;
			title = "规格";
		}else if(!$data.goodsNums){
			wcode = 4;
			title = "数量";
		}else if(!$data.goodsPrice){
			wcode = 5;
			title = "单价";
		}else if(!$data.warehouseAddress){
			wcode = 6;
			title = "仓库";
		}else if(!$data.goodsEndate){
			wcode = 7;
			title = "有效期";
		}

		if(wcode){
			this.setData({ warningCode: wcode })
			setTimeout((xxoo) => {
				xxoo.setData({ warningCode: 0 })
			}, 3000, $me);
			wx.showToast({ 
				title: title + "不能为空",
				duration: 2000, 
				icon: "none"
			});
			return;
		}

		var post_data = {
			//"id": 0,
			//"contact": "",
			//"contactId": 0,
			//"createTime": "",
			"address": $data.warehouseAddress,
			"addressId": $data.warehouseID,
			"description": $data.goodsRemark,
			"finishTime": $data.goodsEndate + " 23:59:59",
			"goodsList": [{
				"categoryId": $data.categoryList[$data.categoryIndex].id,
				"description": $data.goodsSpeci, //规格
				"files": $data.picList,
				"goodsId": $data.goodsList[$data.goodsIndex].id,
				//"id": 0,
				//"sourceId": 0,
				//"sourceType": 0,
				"countMode": 1,
				"quantity": 0,
				"weight": 0,
				"totalPrice": ($data.goodsPrice * $data.goodsNums),
				"unitPrice": $data.goodsPrice,
				"volume": $data.goodsNums
			}],
			"jhbId": $data.jhbcID,
			"jhbName": $data.jhbcName,
			"phone": $data.jhbcPhone,
			//"modifyTime": "",
			//"publishStatus": 0,
			//"requirementCode": "",
			//"startTime": ""
		};

		$me.setData({ isAjaxing: 1 });

		if($data.theXqID){ //修改
			post_data["id"] = $data.theXqID;
			post_data["goodsList"][0]["id"] = $data.goodsXID;
			delta = 2;//返回需求列表那一页
		}

		Xsp.postData("trade/requirementpublish/addOrUpdateRequirement", post_data, function(res, code){
			if(code===0){
				$me.setData({ isAjaxing: 2 });
				if(!$data.isFromHome){
					Xsp.getPrevPage(delta).setNeedReload();
					setTimeout(function(){ wx.navigateBack({"delta": delta}) }, 500);
				}else{
					setTimeout(function(){ Xsp.gotoPage("../xqgl/list", 1) }, 500);
				}
			}else{
				$me.setData({ isAjaxing: 0 });
			}
		});
	},
	showZjTips:function(){//点击总价时弹出提示
		wx.showToast({ 
			title: "自动计算，无需填写",
			duration: 2000, 
			icon: "none"
		});
	},
	focusMyAss:function() {
		if(!this.data.isTaFocus){
			this.setData({ isTaFocus: true });
		}else{
			this.setData({ isTaFocus: false });
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