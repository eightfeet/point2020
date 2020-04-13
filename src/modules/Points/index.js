
import validate from 'validate-by-health';
import { nodeMap } from './../template';
import {
	createTemplate,
	intercept,
	eventListener,
	isObject,
	removeListener,
	validateParame,
	backfill,
	timerCounter
} from './../helper';
import {messageParame,
	loadingParame} from '~/config';
import { qrCode } from './../../utils/scan';
import { accurePoints, sendValidateCode, bindingPhone } from '~/api';
import Modal from '@eightfeet/modal';
import Loading from '@eightfeet/loading';

// data;
let data = {
	phone: null,
	verificationCode: null,
	antiFakeCode: null
};

// 承接中间数据
const dataTemp = {};

const pointsId = `by-health-points-${(new Date()).getTime()}-${window.Math.floor(window.Math.random()*100)}`;

let isCustomTemplate = false;

/**
 * 积分模块
 */
class Points {
	constructor(param){
		const config = param || {};
		if (isObject(config.data)) {
			data = {
				...data,
				...config.data
			};
		}
		// 当前参数数据
		this.data = {};
		// 历史监听方法
		this.listenerHistory = null;
		// 映射关系
		this.elementNodeMappingField = nodeMap;
		// 验证手机
		this.verifyPhone = false;
		// 绑定手机
		this.bindPhone = true;
		// 禁止修改手机
		this.disabledPhone = config.disabledPhone || false;
		// 隐藏手机
		this.hidePhone = config.hidePhone || false;
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
		// 历史数据
		this.prevData = {
			request: null,
			response: null
		};
		// 创建loading和message
		this.message = new Modal(config.messageParame || messageParame);
		this.loading = new Loading(config.loadingParame || loadingParame);
		// 倒计时前后缀文字
		this.timerCounterText = {
			prefix: config.timerCounterPrefixText || '',
			suffix: config.timerCounterSuffixText || '秒后重试'
		};
	}

	static Modal = Modal
	static Loading = Loading

	/**
	 * 重置数据代理与监听
	 */
	bind = (target, map) =>{
		if (isObject(map)) {
			isCustomTemplate = true;
			this.elementNodeMappingField = {
				...this.elementNodeMappingField,
				...map
			};
		} else {
			isCustomTemplate = false;
		}
		if (!isCustomTemplate) {
			// 创建模板时数据直接写入到模板
			createTemplate(
				this.id,
				(target || this.target),
				this.disabledPhone,
				this.hidePhone,
				(this.verifyPhone || this.bindPhone),
				this.data
			);
		} else {
			// 自定义模板时需要根据映射关系回填数据
			backfill(this.elementNodeMappingField, this.data);
		}
		this.setEvent();
		this.data = Object.create(data);
	}

	/**
	 * setEvent
	 * 1、拦截处理数据
	 * 2、移除历史监听数据
	 * 3、监听并重新关联数据
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
		this.loading.show();
		Promise.resolve()
			.then(() => {
				// 参数验证
				const errorMessage = validateParame(
					this.data,
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
					return bindingPhone({
						validateCode: verificationCode,
						phone,
						openid
					});
				}

				// 验证手机
				if (this.verifyPhone) {
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

			.then(() => this.loading.hide())
			.catch(err => {
				this.loading.hide();
				this.message.create({
					article: err.message
				}).then(() => console.log('弹窗已打开'));
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
			this.message.create({
				article: error
			}).then(() => console.log('弹窗已打开'));
			console.log(error);
			return;
		}
		console.log('获取验证码');
		this.loading.show();
		sendValidateCode(phone)
			.then(() => {
				this.loading.hide();
				const element = document.getElementById(this.elementNodeMappingField.sendVerificationCode);
				if (element) {
					timerCounter(element, this.timerCounterText);
				}
			})
			.catch(err => {
				this.loading.hide();
				this.message.create({
					article: err.message
				}).then(() => console.log('弹窗已打开'));
				console.log(err);
			});
	}
}

export default Points;

/**
 * data
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


