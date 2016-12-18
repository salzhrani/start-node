const Joi = require('joi');

const request = require('./src/request');
const schemas = require('./src/schemas');
const ValidationError = require('./src/errors').ValidationError;

const stringId = Joi.string().min(3).required();

class StartClient{
	constructor(apiKey) {
		this.apiKey = apiKey;
	}
	set key(key) {
		this.apiKey = key;
	}
	get key() {
		return this.apiKey;
	}
	createToken(tokenData) {
		const result = schemas.token.validate(tokenData);
		if (result.error) {
			return Promise.reject(new ValidationError(result.error));
		}
		const opts = {
			method: 'POST',
			path: '/tokens/',
			auth: `${this.apiKey}:`,
		}
		return request(opts, result.value);
	}
	// customer
	addCustomer(customerData) {
		const result = schemas.customer().validate(customerData);
		if (result.error) {
			return Promise.reject(new ValidationError(result.error));
		}
		const opts = {
			method: 'POST',
			path: '/customers/',
			auth: `${this.apiKey}:`,
		}
		return request(opts, result.value);
	}
	getCustomer(customerId) {
		const result = stringId.validate(customerId)
		if (result.error) {
			return Promise.reject(new ValidationError(result.error));
		}
		const opts = {
			path: `/customers/${customerId}`,
			auth: `${this.apiKey}:`,
		}
		return request(opts)
	}
	updateCustomer(customerId, customerData) {
		const result = Joi.validate({ customerId, customerData}, { customerId: stringId, customerData: schemas.customer(true)});
		if (result.error) {
			return Promise.reject(new ValidationError(result.error));
		}
		const opts = {
			method: 'PUT',
			path: `/customers/${customerId}`,
			auth: `${this.apiKey}:`,
		}
		return request(opts, result.value.customerData);
	}
	listCustomers(limit = 20, after, before ) {
		const result = Joi.validate({ limit, after, before}, { limit: Joi.number().integer().positive(), after: schemas.isoDate, before: schemas.isoDate })
		if (result.error) {
			return Promise.reject(new ValidationError(result.error));
		}
		const opts = {
			method: 'GET',
			path: `/customers`,
			auth: `${this.apiKey}:`,
		}
		return request(opts, {pagination: result.value })
	}
	deleteCustomer(customerId) {
		let result = Joi.validate(customerId, Joi.string());
		if (result.error) {
			return Promise.reject(result.error);
		}
		const opts = {
			method: 'DELETE',
			path: `/customers/${customerId}`,
			auth: `${this.apiKey}:`,
		}
		return request(opts);
	}
	// cards
	listCards(customerId) {
		if (typeof customerId !== 'string' || !customerId.trim()) {
			return Promise.reject(new Error('invalid customer id'));
		}
		const opts = {
			path: `/customers/${customerId}/cards`,
			auth: `${this.apiKey}:`,
		}
		return request(opts)
	}
	addCard(customerId, cardData) {
		if (typeof customerId !== 'string' || !customerId.trim()) {
			return Promise.reject(new Error('invalid customer id'));
		}
		const result = Joi.validate(cardData, Joi.alternatives().try(Joi.string(), schemas.token));
		if (result.error) {
			return Promise.reject(result.error);
		}
		const opts = {
			path: `/customers/${customerId}/cards`,
			auth: `${this.apiKey}:`,
			method: 'POST'
		}
		return request(opts, { card: result.value })
	}
	getCard(customerId, cardId) {
		if (typeof customerId !== 'string' || !customerId.trim()) {
			return Promise.reject(new Error('invalid customer id'));
		}
		if (typeof cardId !== 'string' || !cardId.trim()) {
			return Promise.reject(new Error('invalid card id'));
		}
		const opts = {
			path: `/customers/${customerId}/cards/${cardId}`,
			auth: `${this.apiKey}:`,
		}
		return request(opts)
	}
	deleteCard(customerId, cardId) {
		if (typeof customerId !== 'string' || !customerId.trim()) {
			return Promise.reject(new Error('invalid customer id'));
		}
		if (typeof cardId !== 'string' || !cardId.trim()) {
			return Promise.reject(new Error('invalid card id'));
		}
		const opts = {
			path: `/customers/${customerId}/cards/${cardId}`,
			auth: `${this.apiKey}:`,
			method: 'DELETE'
		}
		return request(opts)
	}

	// charges
	addCharge(chargeData) {
		const result = Joi.validate(chargeData, schemas.charge);
		if (result.error) {
			return Promise.reject(result.error);
		}
		const opts = {
			path: '/charges/',
			auth: `${this.apiKey}:`,
			method: 'POST'
		}
		return request(opts, result.value)
	}
	getCharge(chargeId) {
		const result = Joi.validate(chargeId, Joi.string().required());
		if (result.error) {
			return Promise.reject(result.error);
		}
		const opts = {
			path: `/charges/${result.value}`,
			auth: `${this.apiKey}:`,
		}
		return request(opts)
	}
	captureCharge(chargeId, amount) {
		const result = Joi.validate({ chargeId, amount }, { chargeId:Joi.string().required() , amount: Joi.number().positive().integer() });
		if (result.error) {
			return Promise.reject(result.error);
		}
		const opts = {
			path: `/charges/${result.value.chargeId}/capture`,
			auth: `${this.apiKey}:`,
			method: 'POST',
		}
		const params = {};
		if (amount) {
			params.amount = amount;
		}
		return request(opts, params);
	}
	ListCharges(limit = 20, before, after) {
		if (after) {
			Joi.assert(after, schemas.isoDate);
		}
		if (before) {
			Joi.assert(before, schemas.isoDate);
		}
		const opts = {
			path: '/charges',
			auth: `${this.apiKey}:`,
		}
		const pagination = {};
		if (limit && parseInt(limit, 10)) {
			pagination.limit = parseInt(limit, 10)
		}
		if (before) {
			pagination.before = before;
		} else if (after) {
			pagination.after = after;
		}
		return request(opts, { pagination })
	}
	// refund
	addRefund(chargeId, amount, reason) {
		if (typeof chargeId !== 'string' || !chargeId.trim()) {
			return Promise.reject(new Error('Invalid chargeId'));
		}
		const result = Joi.validate({ amount, reason }, schemas.refund);
		if (result.error) {
			return Promise.reject(result.error);
		}
		const opts = {
			path: `/charges/${chargeId}/refunds`,
			auth: `${this.apiKey}:`,
			method: 'POST'
		}
		return request(opts, result.value)
	}
	getRefundsForCharge(chargeId) {
		if (typeof chargeId !== 'string' || !chargeId.trim()) {
			return Promise.reject(new Error('Invalid chargeId'));
		}
		const opts = {
			path: `/charges/${chargeId}/refunds`,
			auth: `${this.apiKey}:`,
			method: 'GET'
		}
		return request(opts);
	}
}

module.exports = StartClient;
