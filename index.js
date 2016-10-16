const request = require('./src/request');
const schemas = require('./src/schemas');
const Joi = require('joi');

class StartClient{
	constructor(apiKey) {
		if (typeof apiKey !== 'string') {
			throw new Error('invalid key, expected a string but got ' + typeof apiKey);
		}
		if (!apiKey.trim()) {
			throw new Error('invalid key');
		}
		this.apiKey = apiKey;
	}
	set key(key) {
		this.apiKey = key;
	}
	get key() {
		return this.apiKey;
	}
	createToken(tokenData) {
		const result = Joi.validate(tokenData, schemas.token);
		if (result.error) {
			return Promise.reject(result.error);
		}
		const opts = {
			method: 'POST',
			path: '/tokens/',
			auth: `${this.apiKey}:`,
		}
		return request(opts, result.value);
	}
	addCustomer(customerData) {
		const result = Joi.validate(customerData, schemas.customer);
		if (result.error) {
			return Promise.reject(result.error);
		}
		const opts = {
			method: 'POST',
			path: '/customers/',
			auth: `${this.apiKey}:`,
		}
		return request(opts, result.value);
	}
	getCustomer(customerId) {
		if (typeof customerId !== 'string' || !customerId.trim()) {
			return Promise.reject(new Error('invalid customer id'));
		}
		const opts = {
			path: `/customers/${customerId}`,
			auth: `${this.apiKey}:`,
		}
		return request(opts)
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
	addCharge(amount, currency, customer_id, cardId, description, email, ip, statementDescriptor, capture, shoppingCart) {
		const chargeData = {};
		chargeData.amount = amount;
		chargeData.currency = currency;
		if (customer_id) {
			chargeData.customer_id = customer_id;
		} else if (cardId) {
			chargeData.card = cardId;
			chargeData.email = email;
		}
		if (description) {
			chargeData.description = description;
		}
		if (ip) {
			chargeData.ip = ip;
		}
		if (statementDescriptor) {
			chargeData.statement_descriptor = statementDescriptor;
		}
		if (capture != null) {
			chargeData.capture = capture;
		}
		if (shoppingCart) {
			chargeData.shopping_cart = shoppingCart;
		}
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
		const opts = {
			path: `/charges/${result.value}`,
			auth: `${this.apiKey}:`,
		}
		return request(opts)
	}
	captureCharge(chargeId, amount) {
		const result = Joi.validate({ chargeId, amount }, { chargeId:Joi.string().required() , amount: Joi.number().positive().integer().required() });
		const opts = {
			path: `/charges/${result.value.chargeId}/capture`,
			auth: `${this.apiKey}:`,
			method: 'POST',
		}
		return request(opts, { amount: result.value.amount });
	}
	ListCharges(limit = 20, before = null, after = null) {
		const params = [];
		if (limit && limit !== 20) {
			params.push(`limit=${limit}`);
		}
		if (before != null) {
			params.push(`before=${before}`);
		}
		if (after != null) {
			params.push(`after=${after}`);
		}
		const opts = {
			path: `/charges/${params.length ? `?${params.join('&')}` : ''}`,
			auth: `${this.apiKey}:`,
		}
		return request(opts)
	}
}

module.exports = StartClient;
