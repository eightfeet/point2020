import {
	isObject
} from './helper';
import defaultErrorCode from './../errorCode';

/**
 * @param error 错误数据
 * @param errorCode 传入的代理错误数据
 */
export default (error, errorCode) => new Promise((resolve) => {
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
		resolve({
			code: error.code,
			message: operateCode[error.code]
		});
	} else {
		resolve(error);
	}
	
});
