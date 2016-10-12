const StartClient = require('..');
const expect = require('code').expect;

const apiKey = 'test_sec_k_49ebce3370d32aad533b3';

describe('client', () => {
	let testCustomer;
	it('validates api key', () => {
		
		try {
			const client = new StartClient(123);
		} catch(e) {
			expect(e.message).to.equal('invalid key, expected a string but got number');
		}
		
		try {
			const client = new StartClient('');
		} catch(e) {
			expect(e.message).to.equal('invalid key');
		}
		
	});
	describe('tokens', () => {
		it('can create a token', (done) => {
			const client = new StartClient('test_open_k_792b8f7b116f2e689d9e');
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
			const client = new StartClient('test_open_k_792b8f7b116f2e689d9e');
			client.createToken({
				number: '4242424242424242',
				exp_month: '11',
				exp_year: '2016',
				cvc: '123'
			})
			.then((result) => {
				client.key = 'test_sec_k_49ebce3370d32aad533b3';
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
	});
	describe('cards', () => {
		let testCard;
		describe('list', () => {
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
				}, (err) => {
					console.log(err);
					done();
				})
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
				}, (err) => {
					console.log(err);
					done(err);
				});
			});
			it('adds cards from token', (done) => {
				const client = new StartClient('test_open_k_792b8f7b116f2e689d9e');
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
				}, (err) => {
					console.log(err);
					done(err);
				});
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
	});
});