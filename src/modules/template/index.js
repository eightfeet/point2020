import s from './template.scss';
import { checkEnv } from './../../utils/scan';

export const nodeMap = {
	phone: `${s.phone}`,
	verificationCode: `${s.verificationCode}`,
	securityCode: `${s.securityCode}`,
	scan: `${s.scan}`,
	sendVerificationCode: `${s.sendVerificationCode}`,
	submit: `${s.submit}`
};

const prefix = 'by-health-points';

export default (phoneDisable) => `<div class="${prefix}-wrap">
    <div class="${prefix}-phone-item">
        <input type="tel" ${phoneDisable ? 'disabled' : ''} id="${s.phone}"/>
    </div>
    <div class="${prefix}-verificationcode-item">
        <input type="tel" id="${s.verificationCode}" />
        <button id="${s.sendVerificationCode}">获取验证码</button>
    </div>
    <div class="${prefix}-securitycode-item">
        <input type="tel" id="${s.securityCode}" />
        ${(checkEnv() === 1 || checkEnv() === 2 || checkEnv() === 3 || checkEnv() === 0) ? `<button id="${s.scan}">扫码</button>` : ''}
    </div>
    <div class="${prefix}-submit-item">
        <button id="${s.submit}">提交</button>
    </div>
</div>`;
