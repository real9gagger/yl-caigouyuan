/* 价格区间组件 */
Component({
	/**
	 * 组件的属性列表
	 */
	options: {
		styleIsolation: "apply-shared"
	},
	properties: {
		rangeList:{
			type: 	Array,
			value: 	[],
		},
		headerText:{
			type: String,
			value: "" //请选择价格区间
		},
		isShow:{
			type: Boolean,
			value: false
		},
		cssStyle:{
			type: String,
			value: ""
		}
	},
	/**
	 * 组件的初始数据
	 */
	data: {
		checkedItems: [],
		minInputs: "",
		maxInputs: ""
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		onCancel: function(){
			this.triggerEvent("cancel", {}, {});
		},
		onChecked: function(evt){
			var nth = evt.currentTarget.dataset["nth"];
			var rlist = this.data.rangeList;

			rlist[nth]["checked"] = !rlist[nth]["checked"];

			this.setData({ 
				rangeList: rlist,
				minInputs: "",
				maxInputs: ""
			});
		},
		onInput: function(){
			var hasCount = 0;
			var rlist = this.data.rangeList;

			rlist.forEach(item => {
				if(item.checked){
					item.checked = false;
					hasCount++;
				}
			});

			if(hasCount > 0){
				this.setData({ rangeList: rlist });
			}
		},
		onConfirm: function(){
			var output = [];
			var $data = this.data;

			if($data.minInputs || $data.maxInputs){
				if(!$data.minInputs){
					$data.minInputs = "0";
				}

				if(!$data.maxInputs){
					$data.maxInputs = "1000000000"; //9个0，十亿
				}

				output = [{min: +$data.minInputs, max: +$data.maxInputs}];

				if(output[0].max < output[0].min){
					wx.showToast({
						title: "最高价格不能小于最低价格",
						icon: "none"
					});
					return;
				}
			}else{
				let rlist = this.data.rangeList;
				rlist.forEach(item => {
					if(item.checked){
						output.push({min: item.start, max: (item.end || 1000000000)});
					}
				});
			}
			this.triggerEvent("confirm", output, {});
		}
	}
})
