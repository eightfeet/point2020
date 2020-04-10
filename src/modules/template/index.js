import s from './template.scss';
import { checkEnv } from './../../utils/scan';

export const nodeMap = {
	phone: `${s.phone}`,
	verificationCode: `${s.verificationCode}`,
	antiFakeCode: `${s.antiFakeCode}`,
	scan: `${s.scan}`,
	sendVerificationCode: `${s.sendVerificationCode}`,
	submit: `${s.submit}`
};

const prefix = 'by-health-points';

export default (disabledPhone, verifyPhone) =>{
	return `<div class="${prefix}-wrap">
        <div class="${prefix}-antifakecode-item">
            <input type="tel" id="${s.antiFakeCode}" maxlength="16" placeholder="输入16位瓶盖防伪码" />
            ${(checkEnv() === 1 || checkEnv() === 2 || checkEnv() === 3) ? `<button id="${s.scan}">扫码</button>` : ''}
        </div>
        <div class="${prefix}-phone-item">
            <input type="tel" ${disabledPhone ? 'disabled' : ''} id="${s.phone}" maxlength="11" placeholder="输入手机号码" />
        </div>
        ${verifyPhone ? `<div class="${prefix}-verificationcode-item">
            <input type="tel" id="${s.verificationCode}" maxlength="4" placeholder="输入验证码" />
            <button id="${s.sendVerificationCode}">获取验证码</button>
        </div>` : ''}
        <div class="${prefix}-submit-item">
            <button id="${s.submit}">提交</button>
        </div>
    </div>`;
};
