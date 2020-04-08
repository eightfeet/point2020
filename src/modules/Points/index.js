
import { nodeMap } from './../template';
import { createTemplate, intercept, eventListener, isObject, removeListener } from './../helper';
import { qrCode } from './../../utils/scan';

// data;
const data = {
	phone: null,
	verificationCode: null,
	securityCode: null
};

// 承接中间数据
const dataTemp = {};

const pointsId = `points${(new Date()).getTime()}-${window.Math.floor(window.Math.random()*100)}`;

let isCustomTemplate = false;

/**
 * 积分模块
 */
class Points {
	constructor(param){
		const config = param || {};
		this.data = null;
		this.listenerHistory = null;
		this.elementNodeMappingField = nodeMap;
		this.disabledPhone = config.disabledPhone || false;
		if (isObject(config.elementIdMapToFields)) {
			this.elementNodeMappingField = config.elementIdMapToFields;
			isCustomTemplate = true;
		}
		this.http = config.http || 'http://www.baidu.com';
		this.target = document.getElementById(config.targetId) || document.body;
		this.id = config.id || pointsId;
	}

	/**
	 * 重置数据代理与监听
	 * 1、拦截处理数据
	 * 2、移除历史监听数据
	 * 3、监听并重新关联数据
	 */
	reset = () =>{
		if (!isCustomTemplate) {
			createTemplate(this.id, this.target, this.disabledPhone, this.elementNodeMappingField);
		}
		this.setEvent();
		this.data = Object.create(data);
	}

	/**
	 * setEvent
	 */
	setEvent = () => {
		let mapData = {};
		if (isObject(this.elementNodeMappingField)) {
			mapData = this.elementNodeMappingField;
		}

		// 数据拦截代理
		intercept(data, mapData, dataTemp);

		// 移除历史监听事件
		if (this.listenerHistory) {
			removeListener(this.listenerHistory);
		}
		
		// 初始化监听事件并保存
		this.listenerHistory = eventListener(data, mapData, {
			scan: this.scan,
			sendVerificationCode: this.sendVerificationCode,
			submit: this.submit
		});
	}

	mapElementIdToFields = () => {

	}
	/**
	 * 扫码
	 */
	scan = () => {
		qrCode()
			.catch(err => console.log(err));
	}
	/**
	 * 提交
	 */
	submit = () => {
		console.log('tijiao');
	}
	/**
	 * 获取验证码
	 */
	sendVerificationCode = () => {
		console.log('获取验证码');
	}
}

export default Points;

/**
 * parame
 * elementIdMapToFields
 * phoneDisable
 
 * onBeforScan
 * onScan
 * onAfterScan
 
 * onBeforSubmit
 * onSubmit
 * onAfterSubmit
 
 * onBeforGetValidateCode
 * onGetValidateCode
 * onAfterGetValidateCode
 */

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


