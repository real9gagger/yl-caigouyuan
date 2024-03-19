// 搜索组件
Component({
	/**
	 * 组件的属性列表
	 */
	options:{
		styleIsolation: "apply-shared"
	},
	properties: {
		placeHolder: {
			type: 	String,
			value: 	"请输入要查找的内容",
		},
		sbtnText:{
			type: 	String,
			value: 	"查找",
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		isSearchFocus: false,
		searchKeywords: "",
		searchBoxHeight: 56,
		searchBoxStyle: "",
		inputBoxHeight: 40,
		lastSlideMode: 0
	},
	pageLifetimes:{
		show: function() {
			this.getBoxHeight();
		}
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		getBoxHeight: function(){
			var $me = this;
			var domQuery = wx.createSelectorQuery().in($me);

			domQuery.select("#page_top_search_box").boundingClientRect();
			domQuery.select("#page_search_input_box").boundingClientRect();

			domQuery.exec(function(res){
				//console.log(res);
				if(res && res.length && res[0]){
					$me.setData({
						searchBoxHeight: Math.floor(res[0].height),
						inputBoxHeight:  Math.floor(res[1].height)
					});

					/*for(let ix = 0;ix < res.length;ix++){
						if(res[ix].id === "page_top_search_box"){
							$me.setData({
								searchBoxHeight: Math.floor(res[ix].height)
							});
						}else{
							$me.setData({
								inputBoxHeight: Math.floor(res[ix].height)
							});
						}
					}*/
				}
			});
		},
		onInputFocus: function(){
			this.setData({
				isSearchFocus : true
			});
		},
		onInputBlur: function(){
			this.onInputSearching();
		},
		onInputInputing: function(){
			//nothing to do.
		},
		onInputSearching: function(){
			var $me = this;
			var txt = $me.data.searchKeywords.trim();
			$me.setData({
				isSearchFocus : false
			});

			$me.triggerEvent("searching", {"keywords": txt}, {});

			return;
		},
		setSlideInOut: function(mode) {
			var $data = this.data;
			var style = (mode <= 2 ? "margin-top:-" : "top:-");

			if($data.lastSlideMode === mode) return;
			
			if(!mode){
				style += "0";
			}else if(mode===1 || mode===3){
				style += ($data.searchBoxHeight - ($data.searchBoxHeight - $data.inputBoxHeight) / 2).toString(); //减去 padding-bottom
			}else{
				style += $data.searchBoxHeight.toString();
			}
			style += "px";

			this.setData({
				searchBoxStyle: style,
				lastSlideMode: mode
			});
		}
	}
})
