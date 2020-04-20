
import validate from 'validate-by-health';
import * as nativeAppJssdk from '@byhealth/native-app-jssdk';
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
import { qrCode, barCode } from './../../utils/scan';
import { accurePoints, sendValidateCode, bindingPhone } from '~/api';
import Modal from '@eightfeet/modal';
import Loading from '@eightfeet/loading';
import handleErrorCode from './../handleErrorCode';

// data;
let data = {
	phone: null,
	antiFakeCode: null
};

// 承接中间数据
const dataTemp = {};

let isCustomTemplate = false;

class PointsError extends Error {
	constructor(message, code) {
		super(message, code);
		this.message = message;
		this.code = code;
	}
}

/**
 * 积分模块
 */
class Points {
	constructor(param){
		const pointsId = `by-health-points-${(new Date()).getTime()}-${window.Math.floor(window.Math.random()*100)}`;
		const config = param || {};
		if (isObject(config.data)) {
			data = {
				...data,
				...config.data,
				...(config.verifyPhone || config.bindPhone) ? {verificationCode: null} : {}
			};
		}
		// 当前参数数据
		this.data = {};
		// 历史监听方法
		this.listenerHistory = null;
		// 映射关系
		this.elementNodeMappingField = nodeMap(pointsId);

		// 自定义表单输入元素
		if (isObject(config.elementNodeMappingField)) {
			this.elementNodeMappingField = config.elementNodeMappingField;
			isCustomTemplate = true;
		}
		// 验证手机
		this.verifyPhone = config.verifyPhone || false;
		// 绑定手机
		this.bindPhone = config.bindPhone || false;
		// 错误提示
		this.errorCodeMap = config.errorCodeMap;
		// 禁止修改手机
		this.disabledPhone = config.disabledPhone || false;
		// 隐藏手机
		this.hidePhone = config.hidePhone || false;
		// 定义防伪积分接口
		this.API = {
			...(isObject(config.API) ? config.API : {})
		};
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
		// 扫码回调
		this.onScan = config.onScan;
		// 异常处理
		this.handleError = config.handleError;
		// 追加验证处理 主动
		this.handleValidate = config.handleValidate;
		// 验证手机计时器参数
		this.verifyPhoneCountdown = {
			interval: 60,
			buttonText: '获取验证码',
			countdownText: (time) => `${time}秒后重试`,
			...(isObject(config.verifyPhoneCountdown) ? config.verifyPhoneCountdown : {})
		};

		if (config.autoMount !== false) {
			this.mount(config.targetId, config.elementNodeMappingField);
		}

		// 初始化
		if (typeof config.onInit === 'function') {
			config.onInit();
		}

		// Message关闭回调
		this.onCloseMessage = config.onCloseMessage;
	}

	static PointsError = PointsError
	static tools = {
		Modal,
		Loading,
		validate,
		nativeAppJssdk,
		// 整合微信与营养管家App扫码SDK
		scan:{
			qrCode,
			barCode
		}
	}

	/**
	 * 增加一个访问属性直接访问数据(原型数据和自定数据)
	 */
	get $data() {
		return {
			...JSON.parse(JSON.stringify(data)),
			...this.data
		};
	}

	/**
	 * 设置参数
	 */
	setData = (data) => {
		if (isObject(data)) {
			Object.keys(data).forEach(key => {
				this.data[key] = data[key];
			});
		}
	}
	

	/**
	 * 挂载Points
	 * 重置数据代理与监听
	 */
	mount = (targetId, map) =>{
		if (isObject(map)) {
			isCustomTemplate = true;
			this.elementNodeMappingField = {
				...this.elementNodeMappingField,
				...map
			};
		} else {
			isCustomTemplate = false;
		}
		this.data = Object.create(data);
		if (!isCustomTemplate) {
			// 创建模板时数据直接写入到模板
			createTemplate(
				this.id,
				(document.getElementById(targetId) || this.target),
				this.disabledPhone,
				this.hidePhone,
				(this.verifyPhone || this.bindPhone),
				this.data,
				this.verifyPhoneCountdown.buttonText,
				this.elementNodeMappingField,
			);
		} else {
			// 自定义模板时需要根据映射关系回填数据
			backfill(this.elementNodeMappingField, this.data);
		}
		this.setEvent();
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
				if (typeof this.onScan === 'function') {
					this.onScan(res);
				}
			})
			.catch(err => console.log(err));
	}

	/**
	 * 提交
	 */
	submit = () => {
		const {phone, antiFakeCode, verificationCode, openid, accountType, ...other } = this.data;

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
					throw new PointsError(errorMessage, -1000);
				}
			})
			.then(() => typeof this.handleValidate === 'function' ? this.handleValidate(this.$data) : null)
			.then(() => {
				// 绑定手机(优先！)
				if (this.bindPhone) {
					return bindingPhone({
						validateCode: verificationCode,
						phone,
						accountType,
						openid
					}, this.API.bindPhone).catch(err => {
						throw new PointsError(err.message, err.code);
					});
				}
				
				// 验证手机
				if (this.verifyPhone) {
					return bindingPhone({
						validateCode: verificationCode,
						accountType,
						phone
					}, this.API.bindPhone).catch(err => {
						throw new PointsError(err.message, err.code);
					});
				}
			})
			.then(() => {
				// 防伪积分
				return accurePoints({
					mobilePhone: phone,
					antifakecode: antiFakeCode,
					...other
				}, {}, this.API.antifakecode).catch(err => {
					throw new PointsError(err.message, err.code);
				});
			})
			.then(res => {
				// 成功回调 被动
				if (typeof this.onSubmit === 'function') this.onSubmit(res);
				return res;
			})
			.then(res => {
				this.loading.hide();
				this.prevData = {
					response: res,
					request: this.$data
				};
			})
			.catch(err => {
				// 失败回调
				this.loading.hide();
				this.prevData = {
					response: {code: err.code, message: err.message},
					request: this.$data
				};
				
				// 处理错误信息 主动
				if (typeof this.handleError === 'function') {
					this.handleError(err);
				} else {
					throw err;
				}
			})
			.catch(err => {
				console.log(9999, this.message);
				if (err instanceof PointsError) {
					handleErrorCode(err, this.errorCodeMap)
						.catch(err => {
							this.handleErrorMessage(err);
						});
				}
			});
	}

	handleErrorMessage = err => {
		if (typeof this.onCloseMessage === 'function') {
			this.message.state.onCancel = () => {
				this.onCloseMessage({
					message: err.message,
					code: err.code
				});
			};
		}
		this.message.create({
			header: '<h3>温馨提示</h3>',
			article: err.message,
			footer: '<button class="by-health-points-message_button">确定</button>'
		})
			.then(() => {
				const btn = document.getElementById(this.message.state.id).querySelector('.by-health-points-message_button');
				btn.onclick = () => {
					this.message.hide();
					if (typeof this.onCloseMessage === 'function') {
						this.onCloseMessage({
							message: err.message,
							code: err.code
						});
					}
				};
			});
	}

	/**
	 * 获取验证码
	 */
	sendVerificationCode = () => {
		const { phone } = this.data;
		
		this.loading.show();
		Promise.resolve()
			.then(() => {
				const error = validate({
					VPhone: phone
				});
				if (error) {
					// 处理验证结果
					throw new PointsError(error, -1000);
				}
			})
			.then(() => {
				return sendValidateCode(phone, this.API.sendValidateCode)
					.catch(err => {
						throw new PointsError(err.message, err.code);
					});
			})
			.then(() => {
				this.loading.hide();
				const element = document.getElementById(this.elementNodeMappingField.sendVerificationCode);
				if (element) {
					timerCounter(element, this.verifyPhoneCountdown);
				}
			})
			.catch(err => {
				this.loading.hide();
				this.handleErrorMessage(err);
			});
	}
}

export default Points;
