//首页-登录
"use strict";
var Xsp = require("../../utils/plus.js");
//var app = getApp();
Page({
    data: {
        motto: '登 录',
        myUserInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        canIUseGetUserProfile: false,
        appEnvVersion: "",
        isLogining: 0, //0-未登录，1-正在登录，2-已登录
        userName:"",
        userPswd:"",
        focusIndex:-1,
        canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'),
        isShowAuthPanel: false, //是否显示授权面板
        isSlideAuthPanel: false, //是否滑动授权面板
        isSeePswd: false, //是否查看密码
    },
    onLoad: function () {
        if (wx.getUserProfile) {
            this.setData({
                canIUseGetUserProfile: true
            });
        }

        wx.showShareMenu({
            withShareTicket: true,
            menus: ["shareAppMessage", "shareTimeline"]
        });

        var minp = wx.getAccountInfoSync().miniProgram;
        var year = (new Date()).getFullYear();
        this.setData({
            appEnvVersion: ((minp.version || "1.5.0") + " " + minp.envVersion + " @" + year)
        });

        try{
            this.setData({
                userName: wx.getStorageSync("user_login_name"),
                userPswd: wx.getStorageSync("user_login_password")
            });
        }catch(ex){
            console.log(ex)
        }
    },
    onShow: function(){
        try{
            let uinfos = wx.getStorageSync("my_wx_account_profiles"); //微信用户资料
            if(uinfos){
                this.setData({
                    myUserInfo: JSON.parse(uinfos),
                    canIUseOpenData: false,
                    hasUserInfo: true
                });
            }else{
                this.showOrHideWxAuth(true);
            }
        }catch(ex){
            console.log(ex);
            this.showOrHideWxAuth(true);
        }
    },
    onShareAppMessage: function () {
        return {
            title: '云上智慧木业采购员小程序',
            path: '/pages/index/index',
            imageUrl: ''
        };
    },
    onShareTimeline: function () {
        return {
            title: '云上智慧木业采购员小程序',
            query: 'from=pyq',
            imageUrl: ''
        };
    },
    bindViewTap: function () {
        this.tryGetUserProfile();
    },
    tryGetUserProfile: function () {
        var _this = this;
        wx.getUserProfile({
            desc: '展示用户信息',
            success: function (res) {
                console.log(res);
                _this.setData({
                    myUserInfo: res.userInfo,
                    hasUserInfo: true,
                    canIUseOpenData: false
                });

                try{
                    wx.setStorageSync("my_wx_account_profiles", JSON.stringify(res.userInfo));
                }catch(ex){
                    console.log(ex);
                }
            }
        });
    },
    getUserInfo: function (e) {
        console.log(e);
        this.setData({
            myUserInfo: e.detail.userInfo,
            hasUserInfo: true
        });
    },
    userLogin: function () {
        var $me = this;
        if($me.data.isLogining){
            return;
        }

        if(!$me.data.userName || !$me.data.userPswd){
            wx.showToast({
              title: "请输入账号和密码",
              icon: "none"
            });
            return;
        }

        try{
            wx.setStorageSync("user_login_name", $me.data.userName);
            wx.setStorageSync("user_login_password", $me.data.userPswd);
        }catch(e){
            console.log(e)
        }
        
        $me.setData({ isLogining: 1 });
        Xsp.cgyLogin($me.data.userName, $me.data.userPswd, function(res){
            if(res){
                $me.gotoCgzy();
                setTimeout(() => {
                    $me.setData({ isLogining: 2 })
                }, 2000);
            }else{
                $me.setData({ isLogining: 0 });
            }
        });
    },
    gotoCgzy: function () {
        wx.showLoading({
            title: "加载中",
            icon: "loading",
            duration: 1000
        });
        wx.switchTab({ url: "../home/home" });
    },
    onInputBlur: function(){
        this.setData({
            focusIndex: -1
        });
    },
    onInputFocus: function(e){
        this.setData({
            focusIndex: +Xsp.getArgs(e, "nth")
        });
    },
    showOrHideWxAuth: function(arg0){//显示或隐藏微信授权
        var $me = this;
        var isshow = (arg0 === true ? true : false);
        if(isshow){
            $me.setData({
                isShowAuthPanel: true
            });
            setTimeout(function() { //延迟一点时间，等待动画完成
                $me.setData({ isSlideAuthPanel: true });
            }, 500);
        }else{
            $me.setData({
                isSlideAuthPanel: false
            });
            setTimeout(function() { //延迟一点时间，等待动画完成
                $me.setData({ isShowAuthPanel: false });
            }, 500);
        }
    },
    tryWxAuth: function(){//尝试微信授权
        this.showOrHideWxAuth(false);
        this.tryGetUserProfile();
    },
    clearLocalStorage: function(){ //删除缓存
        wx.showModal({
			title: "提示",
			content: "清除账户信息",
			confirmColor:"#2e53f4",
			success:function(arg){
				if(arg.confirm){
                    wx.clearStorage({
                        success: (res) => {
                            wx.showToast({
                                title: "已清除",
                                icon: "none"
                            });
                            setTimeout(function(){
                                Xsp.gotoPage("index", 1);
                            }, 1000);
                        },
                    });
                }
            }
        });
    },
    seeThePassword(){
        this.setData({
            isSeePswd: !this.data.isSeePswd
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBRUEsSUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFjLENBQUE7QUFFaEMsSUFBSSxDQUFDO0lBQ0gsSUFBSSxFQUFFO1FBQ0osS0FBSyxFQUFFLElBQUk7UUFDWCxRQUFRLEVBQUUsRUFBRTtRQUNaLFdBQVcsRUFBRSxLQUFLO1FBQ2xCLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLDhCQUE4QixDQUFDO1FBQ25ELHFCQUFxQixFQUFFLEtBQUs7UUFDNUIsYUFBYSxFQUFFLEVBQUU7UUFDakIsZUFBZSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLDZCQUE2QixDQUFDO0tBQ3pHO0lBRUQsV0FBVztJQUlYLENBQUM7SUFDRCxNQUFNO1FBRUosSUFBSSxFQUFFLENBQUMsY0FBYyxFQUFFO1lBQ3JCLElBQUksQ0FBQyxPQUFPLENBQUM7Z0JBQ1gscUJBQXFCLEVBQUUsSUFBSTthQUM1QixDQUFDLENBQUE7U0FDSDtRQUNELEVBQUUsQ0FBQyxhQUFhLENBQUM7WUFDZixlQUFlLEVBQUMsSUFBSTtZQUNwQixLQUFLLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxlQUFlLENBQUM7U0FDNUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUMsV0FBVyxDQUFDO1FBQy9DLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRXRDLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDWCxhQUFhLEVBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxJQUFJO1NBQ2hGLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDRCxpQkFBaUIsRUFBRTtRQUNqQixPQUFPO1lBQ0wsS0FBSyxFQUFFLFVBQVU7WUFDakIsSUFBSSxFQUFFLG9CQUFvQjtZQUMxQixRQUFRLEVBQUUsRUFBRTtTQUNiLENBQUM7SUFDSixDQUFDO0lBQ0QsZUFBZSxFQUFFO1FBQ2YsT0FBTztZQUNMLEtBQUssRUFBRSxVQUFVO1lBQ2pCLEtBQUssRUFBRSxVQUFVO1lBQ2pCLFFBQVEsRUFBRSxFQUFFO1NBQ2IsQ0FBQTtJQUNILENBQUM7SUFDRCxjQUFjO1FBQWQsaUJBWUM7UUFWQyxFQUFFLENBQUMsY0FBYyxDQUFDO1lBQ2hCLElBQUksRUFBRSxRQUFRO1lBQ2QsT0FBTyxFQUFFLFVBQUMsR0FBRztnQkFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO2dCQUNoQixLQUFJLENBQUMsT0FBTyxDQUFDO29CQUNYLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsV0FBVyxFQUFFLElBQUk7aUJBQ2xCLENBQUMsQ0FBQTtZQUNKLENBQUM7U0FDRixDQUFDLENBQUE7SUFDSixDQUFDO0lBQ0QsV0FBVyxFQUFYLFVBQVksQ0FBTTtRQUVoQixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNYLFFBQVEsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVE7WUFDM0IsV0FBVyxFQUFFLElBQUk7U0FDbEIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNELE9BQU87UUFDTCxFQUFFLENBQUMsVUFBVSxDQUFDO1lBQ1osR0FBRyxFQUFFLGNBQWM7U0FDcEIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIGluZGV4LnRzXG4vLyDojrflj5blupTnlKjlrp7kvotcbmNvbnN0IGFwcCA9IGdldEFwcDxJQXBwT3B0aW9uPigpXG5cblBhZ2Uoe1xuICBkYXRhOiB7XG4gICAgbW90dG86ICfnmbvlvZUnLFxuICAgIHVzZXJJbmZvOiB7fSxcbiAgICBoYXNVc2VySW5mbzogZmFsc2UsXG4gICAgY2FuSVVzZTogd3guY2FuSVVzZSgnYnV0dG9uLm9wZW4tdHlwZS5nZXRVc2VySW5mbycpLFxuICAgIGNhbklVc2VHZXRVc2VyUHJvZmlsZTogZmFsc2UsXG4gICAgYXBwRW52VmVyc2lvbjogXCJcIixcbiAgICBjYW5JVXNlT3BlbkRhdGE6IHd4LmNhbklVc2UoJ29wZW4tZGF0YS50eXBlLnVzZXJBdmF0YXJVcmwnKSAmJiB3eC5jYW5JVXNlKCdvcGVuLWRhdGEudHlwZS51c2VyTmlja05hbWUnKSAvLyDlpoLpnIDlsJ3or5Xojrflj5bnlKjmiLfkv6Hmga/lj6/mlLnkuLpmYWxzZVxuICB9LFxuICAvLyDkuovku7blpITnkIblh73mlbBcbiAgYmluZFZpZXdUYXAoKSB7XG4gICAgLy93eC5uYXZpZ2F0ZVRvKHtcbiAgICAvLyAgdXJsOiAnLi4vbG9ncy9sb2dzJyxcbiAgICAvL30pXG4gIH0sXG4gIG9uTG9hZCgpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgaWYgKHd4LmdldFVzZXJQcm9maWxlKSB7XG4gICAgICB0aGlzLnNldERhdGEoe1xuICAgICAgICBjYW5JVXNlR2V0VXNlclByb2ZpbGU6IHRydWVcbiAgICAgIH0pXG4gICAgfVxuICAgIHd4LnNob3dTaGFyZU1lbnUoe1xuICAgICAgd2l0aFNoYXJlVGlja2V0OnRydWUsXG4gICAgICBtZW51czogW1wic2hhcmVBcHBNZXNzYWdlXCIsIFwic2hhcmVUaW1lbGluZVwiXVxuICAgIH0pO1xuXG4gICAgbGV0IG1pbnAgPSB3eC5nZXRBY2NvdW50SW5mb1N5bmMoKS5taW5pUHJvZ3JhbTtcbiAgICBsZXQgeWVhciA9IChuZXcgRGF0ZSgpKS5nZXRGdWxsWWVhcigpO1xuXG4gICAgdGhpcy5zZXREYXRhKHtcbiAgICAgIGFwcEVudlZlcnNpb24gOiAobWlucC52ZXJzaW9uIHx8IFwiMS4xLjFcIikgKyBcIiBcIiArIG1pbnAuZW52VmVyc2lvbiArIFwiIEBcIiArIHllYXJcbiAgICB9KVxuICB9LFxuICBvblNoYXJlQXBwTWVzc2FnZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0aXRsZTogJ+S6keS4iuaZuuaFp+acqOS4muS4muWKoScsXG4gICAgICBwYXRoOiAnL3BhZ2VzL2luZGV4L2luZGV4JyxcbiAgICAgIGltYWdlVXJsOiAnJ1xuICAgIH07XG4gIH0sXG4gIG9uU2hhcmVUaW1lbGluZTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0aXRsZTogJ+S6keS4iuaZuuaFp+acqOS4muS4muWKoScsXG4gICAgICBxdWVyeTogJ2Zyb209cHlxJyxcbiAgICAgIGltYWdlVXJsOiAnJ1xuICAgIH1cbiAgfSxcbiAgZ2V0VXNlclByb2ZpbGUoKSB7XG4gICAgLy8g5o6o6I2Q5L2/55Sod3guZ2V0VXNlclByb2ZpbGXojrflj5bnlKjmiLfkv6Hmga/vvIzlvIDlj5HogIXmr4/mrKHpgJrov4for6XmjqXlj6Pojrflj5bnlKjmiLfkuKrkurrkv6Hmga/lnYfpnIDnlKjmiLfnoa7orqTvvIzlvIDlj5HogIXlpqXlloTkv53nrqHnlKjmiLflv6vpgJ/loavlhpnnmoTlpLTlg4/mmLXnp7DvvIzpgb/lhY3ph43lpI3lvLnnqpdcbiAgICB3eC5nZXRVc2VyUHJvZmlsZSh7XG4gICAgICBkZXNjOiAn5bGV56S655So5oi35L+h5oGvJywgLy8g5aOw5piO6I635Y+W55So5oi35Liq5Lq65L+h5oGv5ZCO55qE55So6YCU77yM5ZCO57ut5Lya5bGV56S65Zyo5by556qX5Lit77yM6K+36LCo5oWO5aGr5YaZXG4gICAgICBzdWNjZXNzOiAocmVzKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlcylcbiAgICAgICAgdGhpcy5zZXREYXRhKHtcbiAgICAgICAgICB1c2VySW5mbzogcmVzLnVzZXJJbmZvLFxuICAgICAgICAgIGhhc1VzZXJJbmZvOiB0cnVlXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcbiAgfSxcbiAgZ2V0VXNlckluZm8oZTogYW55KSB7XG4gICAgLy8g5LiN5o6o6I2Q5L2/55SoZ2V0VXNlckluZm/ojrflj5bnlKjmiLfkv6Hmga/vvIzpooTorqHoh6oyMDIx5bm0NOaciDEz5pel6LW377yMZ2V0VXNlckluZm/lsIbkuI3lho3lvLnlh7rlvLnnqpfvvIzlubbnm7TmjqXov5Tlm57ljL/lkI3nmoTnlKjmiLfkuKrkurrkv6Hmga9cbiAgICBjb25zb2xlLmxvZyhlKVxuICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICB1c2VySW5mbzogZS5kZXRhaWwudXNlckluZm8sXG4gICAgICBoYXNVc2VySW5mbzogdHJ1ZVxuICAgIH0pXG4gIH0sXG4gIGdvdG9YcWooKXtcbiAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgICAgIHVybDogJy4uL3hxai9pbmRleCcsXG4gICAgfSlcbiAgfVxufSlcbiJdfQ==