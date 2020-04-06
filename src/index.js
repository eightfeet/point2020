require('./style/common.scss');
if (window.Promise === undefined) {
	throw new Error('Promise pollyfill not found.');
}

module.exports = require('./modules/Points').default;