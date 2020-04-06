import s from './template.scss';

export const nodeMap = {
	phone: `.${s.phone}`,
	verificationCode: `.${s.verificationCode}`,
	securityCode: `.${s.securityCode}`,
	scan: `.${s.scan}`,
	sendVerificationCode: `.${s.sendVerificationCode}`,
	submit: `.${s.submit}`
};

export default () => `<div class="${s.root}">
    <input type="tel" class="${s.phone}"/>
    <input type="tel" class="${s.verificationCode}" />
    <input type="tel" class="${s.securityCode}" />
    <button class="${s.scan}">扫码</button>
    <button class="${s.sendVerificationCode}">获取验证码</button>
    <button class="${s.submit}">提交</button>
</div>`;