import * as Xsp from "../../utils/plus.js";
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isAjaxing: 0,
		errMsgText: "",
		errMsgCode: 0,
		picBaseUrl: Xsp.globalvars.PIC_BASE_URL,

		completeNames: [],
		completeTimerID: 0,
		completeBoxShow: false,

		orcErrorType:0,//0-初始状态 1-提示，2-成功，3-错误，4-正在识别
		orcErrorMsg:"",
		orcCarNo:"", //识别到的车牌号
		orcCarLicense: "",//识别到的车辆识别代号

		formCarID: 0,
		formCarNo: "",
		formCarLicense: "",
		formBusinessLicense: "",
		formDrivingLicenseFileGuid: "",//"51702a03841142ff84a646ad1c357c16",
        formDrivingLicenseFileId: 0,//1922,
        formOperationCertificateFileGuid: "",//"4e09d4a0964d425fa9938c1dae07bef8", //运营证书照片GUID
        formOperationCertificateFileId: 0,//1923
	},

	gotoUploadPage: function(evt){
		var $data = this.data;
		var pickey = Xsp.getArgs(evt, "pkey");
		var pid = 0;
		var guid = "";
		var tips = "";

		if(pickey === "DL"){//Driving License
			pid = $data.formDrivingLicenseFileId;
			guid = $data.formDrivingLicenseFileGuid;
			tips = "行驶证照片";
		}else{
			pid = $data.formOperationCertificateFileId;
			guid = $data.formOperationCertificateFileGuid;
			tips = "运营证照片";
		}

		Xsp.gotoPage(`../uploader/uploader?pid=${pid}&guid=${guid}&pkey=${pickey}&tips=${tips}`)
	},

	onUploadDone: function(pid,guid,pkey){
		if(pkey === "DL"){//Driving License
			this.setData({
				formDrivingLicenseFileId: pid,
				formDrivingLicenseFileGuid: guid
			});
			this.recognizeVehicleLicense();
		}else{
			this.setData({
				formOperationCertificateFileId: pid,
				formOperationCertificateFileGuid: guid
			});
		}
	},

	saveFuckData: function(){
		var $me = this;
		var $data = $me.data;
		var errmsg = "";
		var errcode = 0;

        if($data.isAjaxing){
          	return;
		}

		if(!$data.formCarNo){
			errmsg = "请填写车牌号";
			errcode = 1;
		}else if(!$data.formDrivingLicenseFileId){
			errmsg = "请上传行驶证照片";
			errcode = 2;
		}

		if(errmsg){
			$me.setData({ errMsgText: errmsg, errMsgCode: errcode });
			setTimeout(function() {
				$me.setData({ errMsgText: "", errMsgCode: 0 });
			}, 3000);
			return;
		}
		
		var post_data = {
			"businessLicense":              $data.formBusinessLicense,
			"carLicense":                   $data.formCarLicense,
			"carNo":                        $data.formCarNo,
			"drivingLicenseFileGuid":       $data.formDrivingLicenseFileGuid,
			"drivingLicenseFileId":         $data.formDrivingLicenseFileId,
			"operationCertificateFileGuid": $data.formOperationCertificateFileGuid,
			"operationCertificateFileId":   ($data.formOperationCertificateFileId || null)
		};
		
		if($data.formCarID){
			post_data["cid"] = $data.formCarID;
		}

		$me.setData({ isAjaxing: 1 });
        Xsp.postData("rms/carlist/saveOrUpdateCarDTO", post_data, function(res, status){
			if(status===0){
				$me.setData({ isAjaxing: 2 });
				setTimeout(function(){ wx.navigateBack() }, 500);
				Xsp.getPrevPage().onLoad();
			}else{
				$me.setData({ isAjaxing: 0 });
			}
        });
	},

	onCarnoClicked: function(){
		var $me = this;
		if(!$me.data.formCarID){ //新增的才显示搜索面板
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

	getMatchesCarNo: function(evt){
		var $me = this;
		var keyword = evt.detail.value.trim();

		clearTimeout($me.data.completeTimerID);

		if(!keyword){
			$me.setData({ completeNames: [] });
			return;
		}

		var tmid = setTimeout(function (){
			$me.setData({ completeNames: null });
        	Xsp.getData("rms/carlist/getVehicleAutocompleteByVehicleNo", {vehicleNo: keyword}, function(res){
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

		Xsp.getData("rms/carlist/getCarDTO/" + item.carId, {}, function(rex){
			$me.setData({
				formCarID: 						0, //新增的，固定为0
				formCarNo: 						rex.carNo,
				formCarLicense: 				rex.carLicense,
				formBusinessLicense: 			rex.businessLicense,
				formDrivingLicenseFileGuid: 	rex.drivingLicenseFileGuid,
        		formDrivingLicenseFileId: 		rex.drivingLicenseFileId,
        		formOperationCertificateFileGuid: rex.operationCertificateFileGuid,
        		formOperationCertificateFileId: rex.operationCertificateFileId,
			});
		});

		setTimeout(function () {//设置一个延迟，等动画执行完成
			$me.setData({
				completeBoxShow: false
			});
		}, 300);
	},

	recognizeVehicleLicense: function(){//识别行驶证照片信息
		var $me = this;
		var $data = $me.data;
		
		if(!$data.formDrivingLicenseFileId){
			$me.setData({ orcErrorType: 0 });
			return
		}

		$me.setData({ 
			orcErrorType: 4,
			orcCarNo: "",
			orcCarLicense: ""
		});

        Xsp.getData("rms/carlist/getVehicleLicenseORC", {vehicleLicenseId : $data.formDrivingLicenseFileId}, function(res){
          var errs = [];
          var orct = 2;

          if(res && (res.vclN || res.vin)){
            if(res.vclN){//车牌号
              if(!$data.formCarNo){
				$me.setData({ formCarNo: res.vclN });
              }else if($data.formCarNo !== res.vclN){
				orct = 3;
				errs.push(`填写的车牌号和识别结果 “${res.vclN}” 不符`);
			  }
			  $me.setData({ orcCarNo: res.vclN });
            }

            if(res.vin){
              if(!$data.formCarLicense){
                $me.setData({ formCarLicense: res.vin });
              }else if($data.formCarLicense !== res.vin){
                orct = 3;
				errs.push(`填写的车辆识别代号和识别结果 “${res.vin}” 不符`);
			  }
			  $me.setData({ orcCarLicense: res.vin });
            }
          }else{
            orct = 1;
		  }
		  
		  $me.setData({ 
			orcErrorType: orct,
			orcErrorMsg: errs.join("；\n")
		  });
        });
    },

	fillInOrcResult: function(){ //填入识别结果
		var $data = this.data;
		
		if($data.orcCarNo){
			this.setData({ formCarNo: $data.orcCarNo });
		}

		if($data.orcCarLicense){
			this.setData({ formCarLicense: $data.orcCarLicense });
		}

		this.setData({ orcErrorType: 2 });
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var $me = this;
		if(options.cid){
        	Xsp.getData("rms/carlist/getCarDTO/" + options.cid, {}, function(res, code, msg){
				$me.setData({
					formCarID: res.cid,
					formCarNo: res.carNo,
					formCarLicense: res.carLicense || "",
					formBusinessLicense: res.businessLicense || "",
					formDrivingLicenseFileGuid: res.drivingLicenseFileGuid || "",
        			formDrivingLicenseFileId: res.drivingLicenseFileId || 0,
        			formOperationCertificateFileGuid: res.operationCertificateFileGuid || "", //运营证书照片GUID
        			formOperationCertificateFileId: res.operationCertificateFileId || 0,
				});
			});
			wx.setNavigationBarTitle({ title: "修改车辆信息" });
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