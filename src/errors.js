const errors = {};

errors.RequestError = class RequestError extends Error{
	constructor(obj) {
		const errObj = typeof obj === 'object' ? obj : {};
		super(errObj.message);
		this.type = errObj.type;
		this.code = errObj.code;
		this.extras = errObj.extras;
		this.isServerError = false;
	}
}
errors.ServerError = class ServerError extends Error{
	constructor(...args) {
		super(...args);
		this.isServerError = true;
	}
}
errors.ValidationError = class ValidationError extends Error{
	constructor(error) {
		super(error.message || 'Validation Error');
		this.isValidationError = true;
		if (error.details) {
			this.details = error.details;
		}
	}
}

module.exports = errors;