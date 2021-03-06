import createHtml from './template';
import validate from 'validate-by-health';
import { hideTipsEl } from './Points';

/**
 * 创建默认模板
 * @param {String} id 模板elementId
 * @param { HTMLElement } target 目标挂载
 * @param { Boolean } disabledPhone 禁用手机
 * @param { Boolean } verifyPhone 是否验证手机
 */
export const createTemplate = ({id, target, disabledPhone, hidePhone, verifyPhone, data, buttonText, tipsText, elementNodeMappingField}) => {
	// 移除
	const hasIdObject = document.getElementById(id);
	if (hasIdObject) hasIdObject.parentNode.removeChild(hasIdObject);
	// 创建
	let div = target.querySelector(`#${id}`);
	div = document.createElement('div');
	div.id = id;
	target.appendChild(div);
	// 重定rootNode内容注入模板
	div.innerHTML = createHtml({
		disabledPhone,
		verifyPhone,
		hidePhone,
		data,
		buttonText,
		tipsText,
		elementNodeMappingField
	});
};

/**
 * 数据拦截与绑定
 * @param { Object } data 被拦截数据
 * @param { Object } elementNodeMappingField dom映射绑定，用于绑定拦截数据到dom，完成数据绑定到表单dom
 * @param { Object } dataTemp
 */
export const intercept = (data, elementNodeMappingField, dataTemp) =>  Object.keys(data).forEach((key) => {
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
				const dom = document.getElementById(elementNodeMappingField[key]);
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
export const eventListener = (data, elementNodeMappingField, operation) => {
	const listener = {};
	const {scan, sendVerificationCode, submit, tips} = operation;
	
	listener.click = e => {
		const TipsEl = document.getElementById(`${elementNodeMappingField.tips}-con`);
		hideTipsEl(TipsEl);

		Object.keys(elementNodeMappingField).forEach(key => {
			if (
				e.target.id === elementNodeMappingField[key] &&
				e.target.tagName !== 'INPUT'
			) {
				switch (key) {
					case 'scan':
						// 创建点击监听扫码事件
						if (typeof scan === 'function') {
							scan();
						}
						break;
					case 'sendVerificationCode':
						// 获取验证码需要操作按钮disable状态，同时不能和INPUT标签冲突，所以务必使用<button>标签
						if (e.target.tagName !== 'BUTTON') {
							throw (new TypeError(
								`Invalid HTMLElement: Expected a 'BUTTON', got a '${e.target.tagName}'.`
							));
						}
						// 创建点击监听发送验证码事件
						if (typeof sendVerificationCode === 'function') {
							sendVerificationCode();
						}
						break;
					case 'submit':
						// 创建点击监听提交按钮事件
						if (typeof submit === 'function') {
							submit();
						}
						break;
					case 'tips':
						// 创建点击监toggle提示型文案
						if (typeof tips === 'function') {
							// 组织冒泡避免tips被body关闭
							e.stopPropagation();
							tips();
						}
						break;
					default:
						break;
				}
			}
		});
	};
	listener.input = e => {
		Object.keys(elementNodeMappingField).forEach(key => {
			if (
				e.target.id === elementNodeMappingField[key] &&
				e.target.tagName === 'INPUT'
			) {
				data[key] = e.target.value;
			}
		});
	};
	document.body.addEventListener('click', listener.click);
	document.body.addEventListener('input', listener.input);
	
	return listener;
};

export const isObject = (data) => {
	return Object.prototype.toString.call(data) === '[object Object]';
};

export const backfill = (elementNodeMappingField, data) => {
	Object.keys(elementNodeMappingField).forEach(key => {
		const id = document.getElementById(elementNodeMappingField[key]);
		if (
			id &&
			id.tagName === 'INPUT'
		) {
			id.value = data[key] || '';
		}
	});
};



/**
 * 移除历史监听
 * @param { Object } listenerHistory
 */
export const removeListener = (listenerHistory) => {
	const { input, click } = listenerHistory;
	if (input) document.body.removeEventListener('input', input);
	if (click) document.body.removeEventListener('click', click);
};

/**
 * 验证提交参数
 * @param {Object} params 提交参数
 */
export const validateParame = (params, condition) => {
	const { verifyPhone, bindPhone } = condition;
	const { phone, antiFakeCode, verificationCode, openid} = params;
	const VData = {
		VSecurityCode: antiFakeCode,
		VPhone: phone
	};

	if (bindPhone) {
		VData.VRequire_verificationCode = [verificationCode, '请填写正确手机验证码', 4];
		VData.VRequire_openid = [openid, '没有openid'];
	}

	if (verifyPhone) {
		VData.VRequire = [verificationCode, '请填写正确手机验证码', 4];
	}

	return validate(VData);
};

/**
 * 60s倒计时
 * @param { HTMLElement } element,
 * @param { Object } timerCounterText = { interval, buttonText, countdownText } 时分秒前后缀
 */

export const timerCounter = (element, { interval, buttonText, countdownText }) => {
	let counter = interval;
	let timer = null;
	const fn = () => {
		counter--;
		element.setAttribute('disabled', true);

		if (typeof countdownText === 'function') {
			element.innerHTML = countdownText(counter) || `${counter}秒后重试`;
		} else {
			element.innerHTML = `${counter}秒后重试`;
		}

		if (counter > 0) {
			window.clearTimeout(timer);
			timer = setTimeout(() => {
				fn();
			}, 1000);
		} else {
			element.removeAttribute('disabled');
			element.innerHTML = buttonText;
			return;
		}
	};

	fn();
};
