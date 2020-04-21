import { checkEnv } from './../../utils/scan';

export const nodeMap = (tag) => ({
	phone: `${tag}-phone`,
	verificationCode: `${tag}-verificationCode`,
	antiFakeCode: `${tag}-antiFakeCode`,
	scan: `${tag}-scan`,
	sendVerificationCode: `${tag}-sendVerificationCode`,
	submit: `${tag}-submit`
});

const is_mobi = navigator.userAgent.toLowerCase().match(/(ipod|iphone|android|coolpad|mmp|smartphone|midp|wap|xoom|symbian|j2me|blackberry|wince)/i) !== null;
const width = window.document.documentElement.clientWidth;
const prefix = 'by-health-points';

export default (disabledPhone, verifyPhone, hidePhone, data, buttonText, elementNodeMappingField) =>{
	const { phone, verificationCode, antiFakeCode, scan, sendVerificationCode, submit} = elementNodeMappingField;
	return `<div class="${prefix}-wrap" style="font-size:${is_mobi ? (31.25 * (width / 750)) : 13}px">
        ${hidePhone ? '' : `<div class="${prefix}-phone-item">
            <input class="${prefix}-phone" type="tel" value="${data.phone || ''}" ${disabledPhone ? 'disabled' : ''} id="${phone}" maxlength="11" placeholder="输入手机号码" />
        </div>`}
        ${verifyPhone ? `<div class="${prefix}-verificationcode-item">
            <input class="${prefix}-verificationcode" type="tel" id="${verificationCode}"  value="${data.verificationCode || ''}" maxlength="4" placeholder="输入验证码" />
            <button class="${prefix}-button-sendverificationcode" id="${sendVerificationCode}">${buttonText || '获取验证码'}</button>
        </div>` : ''}
        <div class="${prefix}-antifakecode-item">
            <input class="${prefix}-antifakecode" type="tel" id="${antiFakeCode}" value="${data.antiFakeCode || ''}" maxlength="16" placeholder="输入16位瓶盖防伪码" />
            ${(checkEnv() !== 1 || checkEnv() === 2 || checkEnv() === 3) ? `<button class="${prefix}-button-scan" id="${scan}">扫描防伪码</button>` : ''}
        </div>
        <div class="${prefix}-submit-item">
            <button class="${prefix}-button-submit" id="${submit}">提交</button>
        </div>
    </div>`;
};
