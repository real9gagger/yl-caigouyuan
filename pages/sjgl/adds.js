import * as Xsp from "../../utils/plus.js";
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isAjaxing: 0,
		errMsgText: "",
		errMsgCode: 0,

		completeNames: [],
		completeTimerID: 0,
		completeBoxShow: false,

		orcErrorType:0,//0-初始状态 1-提示，2-成功，3-错误，4-正在识别
		orcErrorMsg:"",
		orcName:"", //识别司机姓名
		orcIDCard: "",//识别到的身份证号

		formID: 0,
		formName: "",
		formPhone: "",
		formIDcard: "",
		formDriverNo: "",
		formDriverFrontGuid: "", //驾驶证正本照图片GUID
		formDriverFrontPid: 0, //驾驶证正本照图片ID
		formDriverBackGuid: "",
		formDriverBackPid: 0,
		formIDcardFrontGuid: "", //身份证正面照图片GUID
		formIDcardFrontPid: 0, //身份证正面照图片ID
		formIDcardBackGuid: "",
		formIDcardBackPid: 0,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		if(options.did){
			var $me = this;
        	Xsp.getData("rms/driverlist/getDriverDTO/" + options.did, {}, function(info){
				$me.setData({
					formID             : info.did,
					formName           : info.name,
					formPhone          : info.phone,
					formIDcard         : info.idcardNo, //身份证号
					formDriverNo       : info.driverNo, //驾驶证号
					formDriverBackGuid : info.driveLicenceBackFileGuId,
					formDriverBackPid  : (info.driveLicenceBackFileId || 0),
					formDriverFrontGuid: info.driveLicenceFrontFileGuId,
					formDriverFrontPid : (info.driveLicenceFrontFileId || 0),
					formIDcardBackGuid : info.idcardNoBackFileGuId,
					formIDcardBackPid  : (info.idcardNoBackFileId || 0),
					formIDcardFrontGuid: info.idcardNoFrontFileGuId,
					formIDcardFrontPid : (info.idcardNoFrontFileId || 0)
				});
			});
			wx.setNavigationBarTitle({ title: "修改司机信息" });
		}
	},

	gotoUploadPage: function(evt){//设置图片上传结果或者状态
		var $data = this.data;
		var pickey = Xsp.getArgs(evt, "pkey");
		var pid = 0;
		var guid = "";
		var tips = "";

		switch(pickey){
			case "IF": 
				pid = $data.formIDcardFrontPid;
				guid = $data.formIDcardFrontGuid;
				tips = "身份证正面照";
				break;
			case "IB":
				pid = $data.formIDcardBackPid;
				guid = $data.formIDcardBackGuid;
				tips = "身份证背面照";
				break;
			case "DF":
				pid = $data.formDriverFrontPid;
				guid = $data.formDriverFrontGuid;
				tips = "驾驶证正本照";
				break;
			case "DB":
				pid = $data.formDriverBackPid;
				guid = $data.formDriverBackGuid;
				tips = "驾驶证副本照";
				break;
			case "D0": //驾驶证正副本一起拍的
				pid = $data.formDriverFrontPid;
				guid = $data.formDriverFrontGuid;
				tips = "驾驶证（请正副本一起拍）";
				break;
		}
		Xsp.gotoPage(`../uploader/uploader?pid=${pid}&guid=${guid}&pkey=${pickey}&tips=${tips}`)
	},
	onUploadDone: function(pid,guid,pkey){
		switch(pkey){
			case "IF": 
				this.setData({
					formIDcardFrontPid: (pid || 0),
					formIDcardFrontGuid: (guid || "")
				});
				break;
			case "IB":
				this.setData({
					formIDcardBackPid: (pid || 0),
					formIDcardBackGuid: (guid || "")
				});
				break;
			case "DF": //驾驶证正本
				this.setData({
					formDriverFrontPid: (pid || 0),
					formDriverFrontGuid: (guid || "")
				});
				break;
			case "DB":
				this.setData({
					formDriverBackPid: (pid || 0),
					formDriverBackGuid: (guid || "")
				});
				break;
			case "D0"://驾驶证正副本一起拍的（此时正副本图片ID一样！）
				this.setData({
					formDriverFrontPid: (pid || 0),
					formDriverFrontGuid: (guid || ""),
					formDriverBackPid: (pid || 0),
					formDriverBackGuid: (guid || "")
				});
				this.recognizeDriverLicense();
				break;
		}
	},
	saveFuckData:function(){
		var $me = this;
		var $data = $me.data;
		var errmsg = "";
		var errcode = 0;

        if($data.isAjaxing){
          return false;
		}

		if(!$data.formName){
			errcode = 1;
			errmsg = "请填写司机姓名";
		}else if(!$data.formPhone){
			errcode = 2;
			errmsg = "请填写司机手机号";
		}else if(!$data.formIDcard){
			errcode = 3;
			errmsg = "请填写身份证号";
		}/*else if(!$data.formDriverFrontPid){
			errcode = 4;
			errmsg = "请上传驾驶证正本照";
		}else if(!$data.formDriverBackPid){
			errcode = 5;
			errmsg = "请上传驾驶证副本照";
		}else if(!Xsp.isIDCard($data.formDriverNo)){
			errcode = 3;
			errmsg = "无效的驾驶证号，请填身份证号";
		}*/

		if(errmsg){
			$me.setData({ errMsgText: errmsg, errMsgCode: errcode });
			setTimeout(function() {
				$me.setData({ errMsgText: "", errMsgCode: 0 });
			}, 3000);
			return;
		}

        var post_data = {
          "name":                     $data.formName,
          "phone":                    $data.formPhone,
          "idcardNo":                 $data.formIDcard,
          "driverNo":                 ($data.formDriverNo || $data.formIDcard), //如果驾驶证号没填就用身份证替代
          "driveLicenceBackFileGuId": $data.formDriverBackGuid,
          "driveLicenceBackFileId":   ($data.formDriverBackPid || null), //不能传0，要传null
          "driveLicenceFrontFileGuId":$data.formDriverFrontGuid,
          "driveLicenceFrontFileId":  ($data.formDriverFrontPid || null), //不能传0，要传null
          "idcardNoBackFileGuId":     $data.formIDcardBackGuid,
          "idcardNoBackFileId":       ($data.formIDcardBackPid || null), //不能传0，要传null
          "idcardNoFrontFileGuId":    $data.formIDcardFrontGuid,
          "idcardNoFrontFileId":      ($data.formIDcardFrontPid || null), //不能传0，要传null
		};
		
		if($data.formID){
			post_data["did"] = $data.formID;
		}
		
		$me.setData({ isAjaxing: 1 });
        Xsp.postData("rms/driverlist/saveOrUpdateDriverDTO", post_data, function(res, status){
			if(status===0){
				$me.setData({ isAjaxing: 2 });
				setTimeout(function(){ wx.navigateBack() }, 500);
				Xsp.getPrevPage().onLoad(); 
			}else{
				$me.setData({ isAjaxing: 0 });
			}
        });
	},
	onNameClicked: function(){
		var $me = this;
		if(!$me.data.formID){ //新增的才显示搜索面板
			$me.setData({
				completeBoxShow: true
			});
		}
	},
	onInputDone: function(){
		var $me = this;
		setTimeout(function () {//设置一个延迟，等动画执行完成
			$me.setData({
				completeBoxShow: false
			});
		}, 300);
	},
	getMatchesDriver: function(evt){
		var $me = this;
		var keyword = evt.detail.value.trim();

		clearTimeout($me.data.completeTimerID);

		if(!keyword){
			$me.setData({ completeNames: [] });
			return;
		}

		var tmid = setTimeout(function (){
			$me.setData({ completeNames: null });
        	Xsp.getData("rms/driverlist/getDriverAutocompleteByName", {name: keyword}, function(res){
        	  	$me.setData({ completeNames: (res || []) });
        	});
		}, 500);

		$me.setData({ completeTimerID: tmid });

		return;
	},
	onCompleteTaped: function(evt){
		var $me = this;
		var nth = Xsp.getArgs(evt, "nth");
		var item = $me.data.completeNames[nth];

		wx.showLoading({
			title: "正在获取...",
			icon: "loading",
			duration: 500
		});

		Xsp.getData("rms/driverlist/getDriverDTO/" + item.driverId, {}, function(rex){
			$me.setData({
				formID: 			0,//新增时，固定为 0
				formName: 			rex.name,
				formPhone: 			rex.phone,
				formIDcard: 		rex.idcardNo,
				formDriverNo: 		rex.driverNo,
				formDriverFrontGuid:rex.driveLicenceFrontFileGuId,
				formDriverFrontPid: (rex.driveLicenceFrontFileId || 0),
				formDriverBackGuid: rex.driveLicenceBackFileGuId,
				formDriverBackPid: 	(rex.driveLicenceBackFileId || 0),
				formIDcardFrontGuid:rex.idcardNoFrontFileGuId,
				formIDcardFrontPid: (rex.idcardNoFrontFileId || 0),
				formIDcardBackGuid: rex.idcardNoBackFileGuId,
				formIDcardBackPid: 	(rex.idcardNoBackFileId || 0),
			});
		});

		setTimeout(function () {//设置一个延迟，等动画执行完成
			$me.setData({
				completeBoxShow: false
			});
		}, 300);
	},
	recognizeDriverLicense(){//识别驾驶证照片信息
		var $me = this;
		var $data = $me.data;

		if(!$data.formDriverFrontPid){
			$me.setData({ orcErrorType: 0 });
			return;
		}

		$me.setData({ 
			orcErrorType: 4,
			orcName: "",
			orcIDCard: ""
		});
		
        Xsp.getData("rms/driverlist/getDriverLicenseORC", {
          driverLicenseBackId: $data.formDriverFrontPid, //2911,
          driverLicenseFrontId: $data.formDriverFrontPid //2910
        }, function(res){
          	var errs = [];
          	var orct = 2;

          	if(res && (res.name || res.idCard)){
          	  	if(res.name){//姓名
          	  	  	if(!$data.formName){
						$me.setData({ formName: res.name });
          	  	  	}else if($data.formName !== res.name){
          	  	    	orct = 3;
          	  	    	errs.push(`填写的姓名和识别结果 “${res.name}” 不符`);
					}
					$me.setData({ orcName: res.name });
          	  	}
				
          	  	if(res.idCard){
          	  	  	if(!$data.formIDcard){
          	  	    	$me.setData({ 
							formIDcard: res.idCard,
							formDriverNo: res.idCard
						});
          	  	  	}else if($data.formIDcard !== res.idCard){
          	  	    	orct = 3;
          	  	    	errs.push(`填写的身份证号和识别结果 “${res.idCard}” 不符`);
					}
					$me.setData({ orcIDCard: res.idCard });
          	  	}
          	}else{
          	  	orct = 1; //未检测到驾驶证
		  	}

		  	$me.setData({ 
				orcErrorType: orct,
				orcErrorMsg: errs.join("；\n")
		  	});
        });
	},
	fillInOrcResult: function(){ //填入识别结果
		var $data = this.data;
		
		if($data.orcName){
			this.setData({ formName: $data.orcName });
		}

		if($data.orcIDCard){
			this.setData({ formIDcard: $data.orcIDCard });
		}

		this.setData({ orcErrorType: 2 });
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