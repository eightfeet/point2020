require('./style/common');
if (window.Promise === undefined) {
	throw new Error('Promise pollyfill not found.');
}

// data;
const data = {
	phone: null,
	verificationCode: null,
	securityCode: null
};

// 承接中间数据
const dataTemp = {};

/**
 * 数据拦截处理
 * @param { Object } data 被拦截数据
 * @param { Object } idMappingField dom映射绑定，用于绑定拦截数据到dom，完成数据绑定到表单dom
 */
const intercept = (data, idMappingField) =>  Object.keys(data).forEach((key) => {
	dataTemp[key] = data[key];
	Object.defineProperty(data, key, {
		enumerable: true,
		configurable: true,
		get() {
			return dataTemp[key];
		},
		set(newVal) {
			// 数据处理
			dataTemp[key] = newVal;
			if (idMappingField[key]) {
				const dom = document.getElementById(idMappingField[key]);
				if (dom) {
					dom.value = dataTemp[key];
				}
			}
			return dataTemp[key];
		}
	});
});

/**
 * 监听input事件绑定数据
 * @param {*} data 原始数据
 * @param {*} idMappingField dom映射
 */
const eventListener = (data, idMappingField) => {
	const listener = {};
	Object.keys(idMappingField).forEach((key) => {
		const dom = document.getElementById(idMappingField[key]);
		listener[idMappingField[key]] = function(e) {
			data[key] = e.target.value;
			console.log(key, e.target.value);
		};
		dom.addEventListener('input', listener[idMappingField[key]]);
	});
	return listener;
};

class Points {
	constructor(){
		this.data = null;
		this.listenerHistory = null;
		this.idMappingField = null;
	}

	/**
	 * 重置
	 * 1、拦截处理数据
	 * 2、移除历史监听数据
	 * 3、监听并重新关联数据
	 * @param {*} idMappingField 映射数据
	 */
	reset = (idMappingField) => {
		this.idMappingField = idMappingField;
		let mapData = {};
		if (Object.prototype.toString.call(idMappingField) === '[object Object]') {
			mapData = idMappingField;
		}
		
		intercept(data, mapData);
		// 移除历史监听事件
		this.removeListener();
		// 初始化监听事件并保存
		this.listenerHistory = eventListener(data, mapData);
		
		this.data = Object.create(data);
	}

	removeListener = () => {
		if (
			this.listenerHistory &&
			Object.prototype.toString.call(this.listenerHistory) === '[object Object]'
		) {
			// 移除历史监听
			Object.keys(this.listenerHistory).forEach(key => {
				const dom = document.getElementById(key);
				if (dom && typeof this.listenerHistory[key] === 'function') {
					dom.removeEventListener('input', this.listenerHistory[key]);
				}
			});
		}
	}
}

module.exports = Points;
