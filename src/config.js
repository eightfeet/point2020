export const UI = {
	width: 750,
	baseonFontsize: 31.25
};

export const baseUrl = __PRO__ ? 'http://yyj.by-health.com/scrmv2' : 'http://wx-test1.by-health.com/scrmv2';


export const messageParame = {
	id: 'by-health-points-message',
	closable: true,
	style: {
		close: {
			fontStyle: 'normal'
		},
		content: {
			width: `${(640/31.25)}em`,
			maxWidth: '640px',
			backgroundColor: '#fff',
			borderRadius: `${(30/31.25)}em`
		}
	}
};

export const loadingParame = {
	id: 'by-health-points-loading',
	style: {
		vertices: {
			height: '0.5em',
			width: '2px'
		},
		content: {
			backgroundColor: 'rgba(0,0,0,0)'
		}
	}
};


