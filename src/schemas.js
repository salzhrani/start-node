const Joi = require('joi');
const codes = require('validate-currency-code/codes');
const schemas = {};

schemas.card = Joi.object({
	name: Joi.string(),
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

schemas.customer = (update) => Joi.object({
	name: Joi.string().default(null).allow(''),
	email: update ? Joi.string().email() : Joi.string().email().required(),
	card: Joi.alternatives().try(Joi.string(), schemas.card),
	defaultCardId: Joi.string(),
	description: Joi.string(),
}).rename('defaultCardId', 'default_card_id', { ignoreUndefined: true });

schemas.isoDate = Joi.string().isoDate();

schemas.shoppingCart = Joi.object({
	user_name: Joi.string(),
	registered_at: Joi.date().iso(),
	items: Joi.array().items(Joi.object({
		title: Joi.string(),
		amount: Joi.number().integer().positive(),
		quantity: Joi.number().integer().positive(),
	})),
	billing_address: Joi.object({
		first_name: Joi.string(),
		last_name: Joi.string(),
		country: Joi.string().min(2).max(3),
		city: Joi.string(),
		zip: Joi.string(),
		address_1: Joi.string(),
		address_2: Joi.string(),
		phone: Joi.string(),
	}),
	shipping_address: Joi.object({
		first_name: Joi.string(),
		last_name: Joi.string(),
		country: Joi.string().min(2).max(3),
		city: Joi.string(),
		zip: Joi.string(),
		address_1: Joi.string(),
		address_2: Joi.string(),
		phone: Joi.string(),
	}),
});

schemas.charge = Joi.object({
	amount: Joi.number().integer().positive().required(),
	currency: Joi.string().length(3).allow(codes).required(),
	card: Joi.string(),
	customer_id: Joi.string().allow(null),
	description: Joi.string().allow(null),
	email: Joi.string().email(),
	ip: Joi.string().ip(),
	statement_descriptor: Joi.string().regex(/^[a-zA-Z0-9\s]+$/).max(37),
	capture: Joi.boolean().default(true),
	shopping_cart: schemas.shoppingCart,
}).or('card', 'customer_id').or('email', 'customer_id');

schemas.refund = Joi.object({
	amount: Joi.number().integer().positive(),
	reason: Joi.string().allow('duplicate', 'fraudulent', 'requested_by_customer').default(null),
});

module.exports = schemas;