import {baseUrl} from '../config';
import { isObject } from '~/modules/helper';

/**
 *
 * @param {Object} parames 参数
 * @param {Object} options fetch报文参数 {headers:{type}} 注意常用的属性type相当于headers['Content-Type'],type只有两个值 json form，默认json
 * @param {String} apiUrl api接口地址
 *
 */
export function accurePoints(parames, options, apiUrl) {
	const { headers, ...otherOptions } = options || {};
	const { type, ...otherHeaders } = headers || {};
	if (!isObject(parames)) {
		return Promise.reject('参数错误！');
	}
	const operateParames = {
		storeId: '1-WAYZ2', // 默认微信虚拟门店
		channelType: 4, // 默认微信渠道
		...parames
	};

	let paramesString = '';
	if (type==='form') {
		const temp = [];
		Object.keys(operateParames).forEach(key => {
			temp.push(`${key}=${operateParames[key]}`);
		});
		paramesString = temp.join('&');
	} else {
		paramesString = JSON.stringify(operateParames);
	}

	const opreationOptions = {
		method: 'POST',
		headers: {
			'Content-Type': type==='form' ? 'application/x-www-form-urlencoded;charset=utf-8' : 'application/json;charset=utf-8',
			...(otherHeaders || {})
		},
		...(otherOptions || {}),
		credentials: 'include',
		mode: 'cors',
		body: paramesString
	};

	let operateApi = apiUrl ? apiUrl : `${baseUrl}/antifakecode/antifakecodeIntegral`;

	return fetch(operateApi, opreationOptions).then(res => {
		return res.text()
			.then(responseText => new Promise((resolve, reject) => {
				let resp = null;
				try {
					resp = JSON.parse(responseText);
				} catch (error) {
					resp = responseText;
				}
			  return res.status === 200 ? resolve(resp) : reject(resp);
			}
		  ));
	});
}

/**
 * 获取手机验证码
 * @param {String} phone 手机号码
 */
export const sendValidateCode = (phone, apiUrl) => {
	const operateApi = apiUrl ? apiUrl : `${baseUrl}/message/sendValidateCode`;
	const parames =  {
		'taskId': 7,  //任务ID  6:推送语音验证码  7:发送手机验证码  11：福利卡验证码
		'length': 4,  //验证码长度
		phone
	};

	return fetch(operateApi, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		},
		credentials: 'include',
		mode: 'cors',
		body: JSON.stringify(parames)
	}).then(res => {
		return res.text()
			.then(responseText => new Promise((resolve, reject) => {
				let resp = null;
				try {
					resp = JSON.parse(responseText);
				} catch (error) {
					resp = responseText;
				}
			  return res.status === 200 ? resolve(resp) : reject(resp);
			}
		  ));
	});
};

/**
 * 手机绑定
 * @param {Object} data 绑定手机参数
 */
export const bindingPhone = (data, apiUrl) => {
	const operateApi = apiUrl ? apiUrl : `${baseUrl}/auth/consumer/loginByPhone`;
	return fetch(operateApi, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		},
		credentials: 'include',
		mode: 'cors',
		body: JSON.stringify(data)
	}).then(res => {
		return res.text()
			.then(responseText => new Promise((resolve, reject) => {
				let resp = null;
				try {
					resp = JSON.parse(responseText);
				} catch (error) {
					resp = responseText;
				}
			  return res.status === 200 ? resolve(resp) : reject(resp);
			}
		  ));
	});
};

export default {};