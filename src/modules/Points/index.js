
import createHtml, { nodeMap } from './../template';

// data;
const data = {
	phone: null,
	verificationCode: null,
	securityCode: null
};

// 承接中间数据
const dataTemp = {};

/**
 * 数据拦截代理
 * @param { Object } data 被拦截数据
 * @param { Object } elementNodeMappingField dom映射绑定，用于绑定拦截数据到dom，完成数据绑定到表单dom
 */
const intercept = (data, elementNodeMappingField, target) =>  Object.keys(data).forEach((key) => {
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
			if (elementNodeMappingField[key]) {
				const dom = target.querySelector(elementNodeMappingField[key]);
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
 * @param {*} elementNodeMappingField dom映射
 */
const eventListener = (data, elementNodeMappingField, target) => {
	const listener = {};
	Object.keys(elementNodeMappingField).forEach((key) => {
		const dom = target.querySelector(elementNodeMappingField[key]);
		// 绑定所有输入框input事件
		if (dom && dom.tagName === 'INPUT') {
			// 创建输入监听事件
			listener[elementNodeMappingField[key]] = function(e) {
				data[key] = e.target.value;
				console.log(key, e.target.value);
			};

			// 监听
			dom.addEventListener('input', listener[elementNodeMappingField[key]]);

			// 数据回填
			data[key] && (dom.value = data[key]);
		} else {
			switch (key) {
				case 'scan':
					// 创建点击监听扫码事件
					listener[elementNodeMappingField[key]] = function() {
						console.log('扫码');
					};
					break;
				case 'sendVerificationCode':
					// 创建点击监听发送验证码事件
					listener[elementNodeMappingField[key]] = function() {
						console.log('发送验证码');
					};
					break;
				case 'submit':
					// 创建点击监听提交按钮事件
					listener[elementNodeMappingField[key]] = function() {
						console.log('提交结果');
					};
					break;
				default:
					break;
			}
            
			// 监听点击事件
			dom.addEventListener('click', listener[elementNodeMappingField[key]]);
		}
	});
	return listener;
};

const pointsId = `points${(new Date()).getTime()}-${window.Math.floor(window.Math.random()*100)}`;

/**
 * 积分模块
 */
class Points {
	constructor(param){
		const config = param || {};
		this.data = null;
		this.listenerHistory = null;
		this.elementNodeMappingField = null;
		this.http = config.http || 'http://www.baidu.com';
		this.target = document.getElementById(config.targetId) || document.body;
		this.id = config.id || pointsId;
	}

	/**
	 * 重置数据代理与监听
	 * 1、拦截处理数据
	 * 2、移除历史监听数据
	 * 3、监听并重新关联数据
	 * @param {*} elementNodeMappingField 映射数据
	 */
	reset = (elementNodeMappingField) => Promise.resolve()
		// 创建模版
		.then(() => this.createTemplates())
		// 定义html节点与数据的映射关系
		.then(() => {
			this.elementNodeMappingField = elementNodeMappingField || nodeMap;
		})
		// 处理事件
		.then(() => this.setEvent())
		.then(() => {
			// 更新数据
			this.data = Object.create(data);
		})

	/**
	 * setEvent
	 */
	setEvent = () => {
		let mapData = {};
		if (Object.prototype.toString.call(this.elementNodeMappingField) === '[object Object]') {
			mapData = this.elementNodeMappingField;
		}
		// 数据拦截代理
		intercept(data, mapData, this.target);
		// 移除历史监听事件
		this.removeListener();
		// 初始化监听事件并保存
		this.listenerHistory = eventListener(data, mapData, this.target);
	}

	/**
	 * 移除历史监听
	 */
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

	/**
	 * 创建模板
	 */
	createTemplates = () => {
		let div = this.target.querySelector(`#${this.id}`);
		// 没有rootNode时创建一个
		if (!div) {
			div = document.createElement('div');
			div.id = this.id;
			this.target.appendChild(div);
		}
		// 重定rootNode内容注入模板
		div.innerHTML = createHtml();
	}
}

export default Points;

/**
 * 流程
 * 创建皮肤
 * 重置监听与事件绑定
 * Promise.resolve
 * .then(清除与创建模板createTemplates)
 * .then(定义皮肤id映射Field)
 * .then(重置监听与事件绑定)
 * .then(定义接口、扫码按钮、提交事件)
 * end
 */