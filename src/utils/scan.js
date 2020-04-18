import { scanQrCode, scanBarCode, isApp } from '@byhealth/native-app-jssdk';

/**
   * 判断是否为微信小程序
   * @export
   * @returns 0：浏览器，1: 微信，2:小程序, 3: 营养管家App
   */
export function checkEnv() {
	if (isApp()) return 3;
	const ua = window.navigator.userAgent.toLowerCase();
	if (ua.indexOf('miniprogram') !== -1) {
		return 2;
	}
	if (ua.indexOf('micromessenger') !== -1) {
		return 1;
	}
	return 0;
}

export function qrCode() {
	if (checkEnv() === 1 || checkEnv() === 2) {
		return new Promise((resolve, reject) => {
			if (!window.wx) {
				throw new Error('window.wx not found');
			}
			window.wx.scanQRCode({
				desc: 'scanQRCode desc',
				needResult: 1,
				scanType: ['qrCode'],
				success (res) {
					const result = res.resultStr;
					const data = result.slice(result.length - 16,result.length);
				   // 回调
				   resolve(data);
				},
				error(err){
					reject(err);
				}
			});
		});
	}
	if (checkEnv() === 3) {
		return scanQrCode().then(res => {
			const data = res.slice(res.length - 16,res.length);
			return data;
		});
	}
	return Promise.reject('非许可环境, 请在微信环境或者营养管家App中使用扫码');
}

export function barCode() {
	if (checkEnv() === 1 || checkEnv() === 2) {
		if (!window.wx) {
			throw new Error('window.wx not found');
		}
		return new Promise((resolve, reject) => {
			window.wx.scanQRCode({
				desc: 'scanQRCode desc',
				needResult: 1,
				scanType: ['barCode'],
				success (res) {
					const result = res.resultStr;
					const data = result.slice(result.length - 13,result.length);
				   // 回调
				   resolve(data);
				},
				error(err){
					reject(err);
				}
			});
		});
	}
	if (checkEnv() === 3) {
		return scanBarCode().then(res => {
			const data = res.slice(res.length - 13,res.length);
			return data;
		});
	}
	return Promise.reject('非许可环境, 请在微信环境或者营养管家App中使用扫码');
}



