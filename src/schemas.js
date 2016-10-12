const Joi = require('joi');

const schemas = {};

schemas.card = Joi.object({
	name: Joi.string(),
	card: Joi.string().required(),
	number: Joi.string().creditCard().required(),
	exp_year: Joi.date().format('YYYY').required(),
	exp_month: Joi.date().format('MM').required(),
	cvc: Joi.string().min(3).max(4).required(),
});

schemas.token = Joi.object({
	name: Joi.string().default(null).allow(null),
	number: Joi.string().creditCard().required(),
	exp_year: Joi.number().min(1000).max(9999).required(),
	exp_month: Joi.number().min(1).max(12).required(),
	cvc: Joi.string().min(3).max(4).required(),
});

schemas.customer = Joi.object({
	name: Joi.string().default(null).allow(''),
	email: Joi.string().email().required(),
	card: Joi.alternatives().try(Joi.string(), schemas.card),
	description: Joi.string(),
});

module.exports = schemas;