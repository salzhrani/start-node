const errors = {};

errors.RequestError = class RequestError extends Error{
	constructor(obj) {
		const errObj = typeof obj === 'object' ? obj : {};
		super(errObj.message);
		this.type = errObj.type;
		this.code = errObj.code;
		this.extras = errObj.extras;
	}
}
errors.ServerError = class ServerError extends Error{}

module.exports = errors;