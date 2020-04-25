import {
	isObject
} from './helper';
import defaultErrorCode from './../errorCode';

/**
 * @param error 错误数据
 * @param errorCode 传入的代理错误数据
 */
export default (error, errorCode) => new Promise((resolve, reject) => {
	// 默认代理数据
	let operateCode = defaultErrorCode;

	if (isObject(errorCode)) {
		operateCode = {
			...operateCode,
			...errorCode
		};
	}

	const proxyCode = [];
	Object.keys(operateCode).forEach(key => {
		proxyCode.push(Number.parseInt(key, 10));
	});
		
	if (proxyCode.includes(error.code)) {
		const content = operateCode[error.code];
		let errResult = {};
		if (isObject(content)) {
			errResult = {
				code: error.code,
				message: operateCode[error.code].message,
				title: operateCode[error.code].title
			};
		} else {
			errResult = {
				code: error.code,
				message: operateCode[error.code]
			};
		}
		reject(errResult);
	} else {
		reject(error);
	}
	
});
