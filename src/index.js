require('./style/common');
if (window.Promise === undefined) {
	throw new Error('Promise pollyfill not found.');
}

class Points {
	constructor(){
		this.name = 'Points';
	}

	set data(value){
		this._data=value;
		console.log(this._data);
	}
	
	get data(){
		return this._data;
	}
}

module.exports = Points;
