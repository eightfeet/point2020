
import validate from 'validate-by-health';
import { nodeMap } from './../template';
import { createTemplate, intercept, eventListener, isObject, removeListener, validateParame } from './../helper';
import { qrCode } from './../../utils/scan';
import { accurePoints, sendValidateCode, bindingPhone } from '~/api';

// data;
const data = {
	phone: null,
	verificationCode: null,
	antiFakeCode: null
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
		// 验证手机
		this.verifyPhone = false;
		// 绑定手机
		this.bindPhone = true;
		this.disabledPhone = config.disabledPhone || false;
		// 自定义表单输入元素
		if (isObject(config.elementIdMapToFields)) {
			this.elementNodeMappingField = config.elementIdMapToFields;
			isCustomTemplate = true;
		}
		// 定义防伪积分接口
		this.http = config.http || 'http://www.baidu.com';
		// 挂载Dom
		this.target = document.getElementById(config.targetId) || document.body;
		// 模块ID
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
			createTemplate(
				this.id,
				this.target,
				this.disabledPhone,
				(this.verifyPhone || this.bindPhone)
			);
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

	/**
	 * 扫码
	 */
	scan = () => {
		qrCode()
			.then(res => {
				this.data.antiFakeCode = res;
			})
			.catch(err => console.log(err));
	}

	/**
	 * 提交
	 */
	submit = () => {
		const {phone, antiFakeCode, verificationCode, openid, ...other } = this.data;

		Promise.resolve()
			.then(() => {
				// 参数验证
				const errorMessage = validateParame(
					data,
					{
						verifyPhone: this.verifyPhone,
						bindPhone: this.bindPhone
					}
				);
				// 处理验证结果
				if (errorMessage) {
					return Promise.reject({message: errorMessage});
				}
			})
			.then(() => {
				// 绑定手机(优先！)
				if (this.bindPhone) {
					console.log(777788888);
					return bindingPhone({
						validateCode: verificationCode,
						phone,
						openid
					});
				}

				// 验证手机
				if (this.verifyPhone) {
					console.log(99990000);
					return bindingPhone({
						validateCode: verificationCode,
						phone
					});
				}
			})
			.then(() => {
				// 防伪积分
				return accurePoints({
					mobilePhone: phone,
					antifakecode: antiFakeCode,
					...other
				});
			})
			.catch(err => {
				console.log(err);
			});
	}

	/**
	 * 获取验证码
	 */
	sendVerificationCode = () => {
		const { phone } = this.data;
		const error = validate({
			VPhone: phone
		});

		if (error) {
			console.log(error);
			return;
		}
		console.log('获取验证码');
		sendValidateCode(phone);
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


