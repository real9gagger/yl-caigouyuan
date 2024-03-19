// app.js
import * as Xsp from "utils/plus.js";
App({
  onLaunch() {
    // 展示本地存储能力
    //const logs = [];//wx.getStorageSync('logs') || []
    //logs.unshift(Date.now())
    //wx.setStorageSync('logs', logs)
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        // console.log("微信登录成功：", res);
        this.globalData.wxLoginSuccessCode = res.code;
        let cps = getCurrentPages();
        if(cps.length && /\bfrom=gongzhonghao\b/.test(cps[cps.length - 1].route)){ //来自公众号的访问
          console.log("公众号的访问，可以自动登录...")
          Xsp.tryAutoLogin(); //尝试自动登录
        }
      }
    })
  },
  globalData: {
    gbXqjzList: null,//旋切列表
    gbCkdzInfo: null, //仓库地址信息
    bottomBarHeight: 0, //底部导航高度
    wxLoginSuccessCode: "", //微信登录成功时得到的Code字符串
  }
})
