// 添加货物
import * as Xsp from "../../utils/plus.js";
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		countModes:[
			{ code: 1, name: "体积"},
			{ code: 2, name: "重量"},
			{ code: 3, name: "数量"}
		],
		categoryList:[],
		goodsList:[],
		iSelectedMode:0,
		iSelectedCategory:-1,
		iSelectedGoods:-1,
		warningCode:0,
		goodsIndex:-1,
		//小程序不支持 model:value="{{a.b}}" 这样的数据绑定
		form_volume:"",
		form_weight:"",
		form_quantity:"",
		form_price:"",
		form_total:"",
		form_desc:"1270mm*630mm*1.5mm"
	},
	onModesChanged:function(e){
		this.setData({
			iSelectedMode: +e.detail.value
		});
	},
	onCategoryChanged:function(e){
		this.setData({
			iSelectedCategory: +e.detail.value
		});
		this.getGoodsList();
	},
	onGoodsChanged:function(e){
		var nth = +e.detail.value;
		this.setData({
			iSelectedGoods: nth
		});
		var gName = this.data.goodsList[nth].goodsName;
		var houdu = gName.match(/\d+(\.\d+)?mm$/i); //厚度
		if(houdu){
			this.setData({ form_desc: "1270mm*630mm*" + houdu[0] });
		}else{
			this.setData({ form_desc: "1270mm*630mm*" });
		}
	},
	getCategoryList:function(){
		var $me = this;
		Xsp.getData("order/ordergoods/getGoodsCategoryList",{isEnableAjaxCache: true}, function(res){
			var list = res;
			var cgid = 0;

			if(!list || !list.length){
				list = [{ categoryId: 1, categoryName: "桉树（系统生成的选项）" }];
			}

			if($me.data.iSelectedCategory < -10){ //修改货物信息，自动匹配对应的货物名称
				cgid = -($me.data.iSelectedCategory + 10);
				for(let ii = 0; ii < list.length; ii++){
					if(list[ii].categoryId===cgid){
						cgid = ii;
						break;
					}
				}
			}

			$me.setData({
				categoryList: list,
				iSelectedCategory: cgid
			});
			$me.getGoodsList();
		});
	},
	getGoodsList:function(){
		var $me = this;
		var item = $me.data.categoryList[$me.data.iSelectedCategory];
        if(!item){
          	return false;
        }

        if(item.categoryGoods){
			$me.setData({
				goodsList: item.categoryGoods,
				iSelectedGoods: 0,
			});
        }else{
			if($me.data.iSelectedGoods >= 0){
				$me.setData({ iSelectedGoods: -1 });
			}

          	Xsp.getData("order/ordergoods/getGoodsByCategoryId", {"categoryId" : item.categoryId}, function(res){
				item.categoryGoods = res;
				if(!item.categoryGoods || !item.categoryGoods.length){
					item.categoryGoods = [{goodsId: 1, goodsName: "一级板 厚度1.5mm（系统生成的选项）"}];
				}

				var gsid = 0;
				if($me.data.iSelectedGoods < -10){ //修改货物信息，自动匹配对应的货物类型
					gsid = -($me.data.iSelectedGoods + 10);
					for(let ii = 0; ii < item.categoryGoods.length; ii++){
						if(item.categoryGoods[ii].goodsId===gsid){
							gsid = ii;
							break;
						}
					}
				}

            	$me.setData({
					goodsList: item.categoryGoods,
					iSelectedGoods: gsid
				});
          	});
        }
        return true;
	},
	onPriceChanged(e){
		var $me = this;
		var type = Xsp.getArgs(e, "type");
		var num = 0;
		
		switch($me.data.iSelectedMode){
			case 2: num = $me.data.form_quantity; break;
			case 1: num = $me.data.form_weight; break;
			default: num = $me.data.form_volume; break;
		}

		if(!type || type == 1){
			let ppp = $me.data.form_price;
			$me.setData({
				["form_total"]: (num && ppp ? ppp * num : "")
			});
		}else if(type == 2){
			let ttt = $me.data.form_total;
			$me.setData({
				["form_price"]: (num && ttt ? (ttt / num).toFixed(4) : "")
			});
		}
	},
	onSubmitGoods:function(){
		var $data = this.data;
		var wcode = 0;
		var modeItem = $data.countModes[$data.iSelectedMode];
		var categoryItem = $data.categoryList[$data.iSelectedCategory];
		var goodsItem = $data.goodsList[$data.iSelectedGoods];
		
		if((modeItem.code===1 && !$data.form_volume) ||
		   (modeItem.code===2 && !$data.form_weight) ||
		   (modeItem.code===3 && !$data.form_quantity)){
			wcode = 1;
		}else if(!$data.form_price){
			wcode = 2;
		}else if(!$data.form_total){
			wcode = 3;
		}else if(!$data.form_desc){
			wcode = 4;
		}else if(!/^[\d\.]+mm\*[\d\.]+mm\*[\d\.]+mm$/i.test($data.form_desc)){
			wcode = 5;
		}

		if(wcode){
			this.setData({ warningCode: wcode })
			setTimeout((xxoo) => {
				xxoo.setData({ warningCode: 0 })
			}, 3000, this);
			wx.showToast({ 
				title: (wcode !== 5 ? "此项不能为空" : "请填写厚度。格式：8mm*6mm*1.5mm（长*宽*厚）"),
				duration: 2000, 
				icon: "none"
			});
			return;
		}

		var goods = {
			//以下字段【不用】提交到服务器
			goodsName:	(categoryItem.categoryName + " " + goodsItem.goodsName),
			goodsVwq:   this.getGoodsVwq($data.form_volume, $data.form_weight, $data.form_quantity, modeItem.code),
			//以下字段【需要】提交到服务器
			countMode:  modeItem.code,
			goodsCategoryId: categoryItem.categoryId,
			goodsId:	goodsItem.goodsId,
			volume:		(modeItem.code === 1 ? $data.form_volume 	: 0),
			weight:		(modeItem.code === 2 ? $data.form_weight 	: 0),
			quantity:	(modeItem.code === 3 ? $data.form_quantity 	: 0),
			unitPrice:	($data.form_price || 0),
			totalPrice:	($data.form_total || 0),
			unitDesc:	($data.form_desc || "")
		};
		
		Xsp.getPrevPage().updateGoodsList(goods, $data.goodsIndex);

		wx.navigateBack();
	},
	getGoodsVwq:function(v,w,q,m){//体积(v)或重量(w)或数量(q)
		switch(m){
			case 2: return ((w || 0) + " 吨");
			case 3: return ((q || 0) + " 件");
			default:return ((v || 0) + " 方");
		}
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.getCategoryList();
		let gindex = +options.gindex;
		if(gindex || gindex === 0){
			wx.setNavigationBarTitle({ title: "修改货物信息" });
			var ginfos = Xsp.getPrevPage().getGoodsInfos(gindex);
			this.setData({
				goodsIndex: 		gindex,

				iSelectedMode: 		ginfos.countMode - 1,
				iSelectedCategory:	-(ginfos.goodsCategoryId + 10), //临时存储货物名称ID
				iSelectedGoods:		-(ginfos.goodsId + 10), //临时存储货物类型ID

				form_volume:		ginfos.volume,
				form_weight:		ginfos.weight,
				form_quantity:		ginfos.quantity,
				form_price:			ginfos.unitPrice,
				form_total:			ginfos.totalPrice,
				form_desc:			ginfos.unitDesc
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