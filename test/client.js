/* global describe, it */
const StartClient = require('..');
const expect = require('code').expect;

const apiKey = 'test_sec_k_49ebce3370d32aad533b3';
const openApiKey = 'test_open_k_792b8f7b116f2e689d9e';

describe('client', () => {
	let testCustomer;
	let testCard;
	let testCharge;
	it('validates api key', () => {
		
		try {
			new StartClient(123);
		} catch(e) {
			expect(e.message).to.equal('invalid key, expected a string but got number');
		}
		
		try {
			new StartClient('');
		} catch(e) {
			expect(e.message).to.equal('invalid key');
		}
		
	});
	describe('tokens', () => {
		it('can create a token', (done) => {
			const client = new StartClient(openApiKey);
			client.createToken({
				number: '4242424242424242',
				exp_month: '11',
				exp_year: '2016',
				cvc: '123'
			})
			.then((res) =>{
				expect(res.id).to.exist();
				done();
			}, done);
		});
	});
	describe('customers', () => {
		it('can create a customer', (done) => {
			const client = new StartClient(openApiKey);
			client.createToken({
				number: '4242424242424242',
				exp_month: '11',
				exp_year: '2016',
				cvc: '123'
			})
			.then((result) => {
				client.key = apiKey;
				return client.addCustomer({
					name: 'Abdullah',
					email: 'abdullah@msn.com',
					card: result.id,
					description: 'Signed up at the Trade Show in Dec 2014',
				});
			})
			.then((customer) => {
				expect(customer.id).to.exist();
				expect(customer.id.indexOf('cus_')).to.equal(0);
				testCustomer = customer; 
				done();
			})
			.catch(done);
		});
		it('can get a customer', (done) => {
			const client = new StartClient(apiKey);
			client.getCustomer(testCustomer.id)
			.then((customer) => {
				expect(customer).to.exist();
				expect(customer.id).to.equal(testCustomer.id);
				done();
			})
			.catch(done)
		});
		it('can update a custmer', (done) => {
			const client = new StartClient(apiKey);
			client.updateCustomer(testCustomer.id, { name: 'Muhamed' })
			.then((customer) => {
				expect(customer).to.exist();
				expect(customer.id).to.equal(testCustomer.id);
				expect(customer.name).to.equal('Muhamed');
				expect(customer.email).to.equal('abdullah@msn.com');
				done();
			})
			.catch(done)
		});
		it('can list all custmer', (done) => {
			const client = new StartClient(apiKey);
			client.listCustomers(10)
			.then((result) => {
				expect(result).to.exist();
				expect(result.customers).to.exist();
				expect(result.customers).to.be.an.array();
				expect(result.customers.length).to.be.at.most(10);
				done();
			})
			.catch(done)
		});
		it('can delete a customer', (done) => {
			const client = new StartClient(apiKey);
			client.deleteCustomer(testCustomer.id)
			.then((result) => {
				expect(result).to.exist();
				expect(result.id).to.equal(testCustomer.id);
				expect(result.deleted).to.equal(true);
				client.getCustomer(testCustomer.id)
			})
			.then(() => {
				done('Should throw an Error');
			}, (err) => {
				expect(err).to.exist();
				expect(err.message).to.equal('Not Found');
				done();
			})
			.catch(done)
		});
	});
	describe('cards', () => {
		it('lists handles invalid client id', (done) => {
			try {
				const client = new StartClient(apiKey);
				client.listCards(123)
				.catch((e) => {
					expect(e.message).to.equal('invalid customer id');
					done();
				});
			} catch(e) {
				done(e);
			}

		});
		it('lists cards', (done) => {
			const client = new StartClient(apiKey);
			client.listCards(testCustomer.id)
			.then((res) => {
				expect(res).to.exist();
				expect(res.cards).to.be.an.array();
				expect(res.cards.length).to.equal(1);					
				done();
			})
			.catch(done);
		});
		it('adds cards from hash', (done) => {
			const client = new StartClient(apiKey);
			client.addCard(testCustomer.id, {
				number: '4242424242424242',
				exp_month: '11',
				exp_year: '2016',
				cvc: '123'
			})
			.then((res) => {
				expect(res).to.exist();
				expect(res.id).to.exist();
				testCard = res;					
				done();
			})
			.catch(done);
		});
		it('adds cards from token', (done) => {
			const client = new StartClient(openApiKey);
			client.createToken({
				number: '4242424242424242',
				exp_month: '11',
				exp_year: '2016',
				cvc: '123'
			})
			.then((token) => {
				client.key = apiKey;
				return client.addCard(testCustomer.id, token.id)
			})
			.then((res) => {
				expect(res).to.exist();
				expect(res.id).to.exist();					
				done();
			})
			.catch(done);
		});
		it('gets a card', (done) => {
			const client = new StartClient(apiKey);
			client.getCard(testCustomer.id, testCard.id)
			.then((card) => {
				expect(card).to.exist();
				expect(card.id).to.equal(testCard.id);
				done();
			})
			.catch(done);
		});
		it('deletes a card', (done) => {
			const client = new StartClient(apiKey);
			client.deleteCard(testCustomer.id, testCard.id)
			.then((card) => {
				expect(card).to.exist();
				expect(card.id).to.equal(testCard.id);
				expect(card.deleted).to.equal(true);
				done();
			})
			.catch(done);
		});
	});
	describe('charges', () => {
		describe('add', () => {
			it('adds a charge with customer id', (done) => {
				const client = new StartClient(openApiKey);
				client.createToken({
					number: '4242424242424242',
					exp_month: '11',
					exp_year: '2016',
					cvc: '123'
				})
				.then((res) => {
					client.key = apiKey;
					return client.addCharge(100, 'SAR', null, res.id, null, 'abdullah@msn.com');
				})
				.then((charge) => {
					expect(charge).to.exist();
					expect(charge.id).to.exist();
					expect(charge.currency).to.equal('SAR');
					expect(charge.amount).to.equal(100);
					done();
				})
				.catch(done);
			});
			it('adds a charge with card token', (done) => {
				const client = new StartClient(openApiKey);
				client.createToken({
					number: '4242424242424242',
					exp_month: '11',
					exp_year: '2016',
					cvc: '123'
				})
				.then((result) => {
					client.key = apiKey;
					return client.addCustomer({
						name: 'Abdullah',
						email: 'abdullah@msn.com',
						card: result.id,
						description: 'Signed up at the Trade Show in Dec 2014',
					});
				})
				.then((res) => {
					client.key = apiKey;
					return client.addCharge(100, 'SAR', res.id, null, null, 'abdullah@msn.com', null, null, false);
				})
				.then((charge) => {
					testCharge = charge;					
					expect(charge).to.exist();
					expect(charge.id).to.exist();
					expect(charge.currency).to.equal('SAR');
					expect(charge.amount).to.equal(100);
					expect(charge.captured_amount).to.equal(0);
					expect(charge.state).to.equal('authorized');
					done();
				})
				.catch(done);
			});
		});
		describe('get', () => {
			it('works', (done) => {
				const client = new StartClient(apiKey);
				client.getCharge(testCharge.id)
				.then((charge) => {
					expect(charge).to.exist();
					expect(charge.id).to.equal(testCharge.id);
					done();
				}, done);
			});
		});
		describe('capture', () => {
			it('works', (done) => {
				const client = new StartClient(apiKey);
				client.captureCharge(testCharge.id, 100)
				.then((charge) => {
					expect(charge).to.exist();
					expect(charge.id).to.exist();
					expect(charge.currency).to.equal('SAR');
					expect(charge.amount).to.equal(100);
					expect(charge.captured_amount).to.equal(100);
					expect(charge.state).to.equal('captured');
					done();
				}, done);
			});
		});
		describe('list', () => {
			it('works', (done) => {
				const client = new StartClient(apiKey);
				client.ListCharges()
				.then((data) => {
					expect(data.charges).to.exist();
					expect(data.charges.length).to.be.at.least(1);
					if (data.meta && data.meta.pagination && data.meta.pagination.before) {
						return client.ListCharges(20, data.meta.pagination.before);
					}
					done();
				})
				.then((data) => {
					expect(data.charges).to.exist();
					expect(data.charges.length).to.be.at.least(1);
					done();
				}, done);
			});
		});
	});
	describe('refunds', () => {
		it('creates a new refund', (done) => {
			const client = new StartClient(apiKey);
			client.createRefund(testCharge.id, 51)
			.then((charge) => {
				expect(charge).to.exist();
				expect(charge.object).to.equal('refund');
				expect(charge.charge_id).to.equal(testCharge.id);
				expect(charge.charge.refunded_amount).to.equal(51);
				expect(charge.charge.state).to.equal('partially_refunded');
				done();
			})
			.catch(done)
		});
		it('lists refunds on a charge', (done) => {
			const client = new StartClient(apiKey);
			client.getRefundsForCharge(testCharge.id)
			.then((charge) => {
				expect(charge).to.exist();
				expect(charge.refunds).to.be.an.array();
				expect(charge.refunds).to.be.have.length(1);
				expect(charge.refunds[0].charge_id).to.equal(testCharge.id);
				expect(charge.refunds[0].charge.refunded_amount).to.equal(51);
				expect(charge.refunds[0].charge.state).to.equal('partially_refunded');
				done();
			})
			.catch(done)
		});
	});
});