# Node.js Client Library for [Start](https://start.payfort.com/)
[![Travis CI](https://travis-ci.org/salzhrani/start-node.svg?branch=master)](https://travis-ci.org/salzhrani/start-node)
## Prerequisites

Before using this library, you must have:
* API key(s)

## Installation
```shell
npm install start-node --save
```
or
```shell
yarn add start-node
```
## Initialization
```js
const client = new StartClient(API_KEY);
```
it is also possible to change the key anytime.
```js
client.key = OTHER_KEY;
```
subsequent calls will use the new key.

## Usage
This library uses promises, so making calls is usually as follows

```js
// init a client
const client = new StartClient(API_KEY);

// get customer list
client.listCustomers()
.then((customers) => {
    // process customers
}, (err) => {
    // handle error here
});
```
## Errors
in error handlers you can get more information about the error,

```js
// init a client
const client = new StartClient(BAD_KEY);

// get customer list
client.listCustomers()
.then((customers) => {
    // not called
}, (err) => {
    if (err.isValidationError) {
        // a validation error occurs when you provide 
        // missin or invalid arguments to a functions
        console.log(err.details);
    }
    // check if it is a server (500) error
    else if (err.isServerError) {
        console.log('Server error!!!');
    } else {
        // error object exposes debug properties

        // error.type can be 'request', 'processing', 'banking' or 'authentication'
        console.log('Error type:', err.type);

        // error.code is a string that identifies the error
        console.log('Error code:', err.code);

        // error.message is a human readable explaintion
        console.log('Error message:', err.message);

        // error.extras is an object that provides bad params if any
        console.log('Error extras:', err.extras);
    }
});
```

more on error codes and types [here](https://docs.start.payfort.com/references/api/#errors)

## Function reference
----
### Card functions
Information about the card data structure can be found [here](https://docs.start.payfort.com/references/api/#the-card-object)

Create a card by supplying the card information or a token

```js
const cardData = {
    name: 'Abdullah example.com`Ahmed', // optional, 
    number: '4242424242424242',
    ip: '10.10.10.10', // optional
    statement_descriptor: 'My store', // optional; What the customer sees on their credit card statement

    exp_year: 2018,me: 'Abdullah example.com`Ahmed', // optional,
    exp_month: 11,
    cvc: '123'
};

// add the card
client.addCard(customerId, cardData)
.then((card) => {
    // proceed
}, (err) => {
    // handle Error
});

// OR

client.createToken({
    number: '4242424242424242',
    exp_month: '11',
    exp_year: '2016',
    cvc: '123'
})
.then(token => {
    return client.addCard(customerId, token.id);
})
.then((card) => {
    // proceed
}, (err) => {
    // handle Error
});
```

Get a card by specifying **customer id** and **card id**

```js
client.getCard(customerId, cardId)
.then((card) => {
    // handle card
}, (err) => {
    //handle error
})
```

Delete a card by specifying **customer id** and **card id**

```js
client.deleteCard(customerId, cardId)
.then((card) => {
    // handle card
}, (err) => {
    //handle error
})
```

List a customer cards

```js
client.listCards(customerId)
.then((cards) => {
    // handle the array of cards
}, (err) => {
    //handle error
})
```

### Charge functions

Add a charge to a customer

```js

const charge = {
    amount: 100, // required; A positive integer in the smallest currency unit
    currency: 'SAR', // required: ISO 3 letter country code
    customer_id: customerId, // Not required if `email` AND `card` are provided
    card: cardId, // Not required if `customer_id` is provided
    description: 'some description', // optional
    email: 'Abdullah@example.com',  // Not required if `customer_id` is provided
    ip: '10.10.10.10', // optional
    statement_descriptor: 'My store', // optional; What the customer sees on their credit card statement
    capture: true, // optional, defaults to true, capture or just authorize and capture later
    shopping_cart: { // optional
        user_name: 'username',
        registered_at: '2015-11-17T11:07:59.257Z',
        items: [{
            title: 'iPhone',
            amount: 150000,
            quantity: 1
        }],
        billing_address: {
            first_name: 'Abdullah',
            last_name: 'Ahmed',
            country: 'UAE',
            city: 'Dubai',
            address_1: '201, BT Building',
            address_2: 'Knowledge Village',
            phone: '+97144444444'
        },
        shipping_address: {
            first_name: 'Abdullah',
            last_name: 'Ahmed',
            country: 'UAE',
            city: 'Dubai',
            address_1: '201, BT Building',
            address_2: 'Knowledge Village',
            phone: '+97144444444'
        }, 
    }
};

client.addCharge(charge)
.then(charge => {
    // handle charge
}, err => {
    // handle error
})
```

the returned charge object details can be viewed [here](https://docs.start.payfort.com/references/api/#the-charge-object)

Get a charge

```js
client.getCharge(chargeId)
.then((charge) => {
    // handle charge
}, (err) => {
    //handle error
})
```

Capture an authorized charge and optionally update the amount. note: you can decrease the amount only

```js
client.captureCharge(chargeId, newAmount)
.then((charge) => {
    // handle charge
}, (err) => {
    //handle error
})
```

List all authorizations, optionally limit the results and paginate by providing dates

```js
// latest 20 charges
client.ListCharges()
.then(result => {
    // note that `result` is an object with `charges` property and `meta` property which holds pagination information
    // { charges: [], meta : { pagination: { before : ISODate, after: ISODate }}}
    console.log('charges', result.charges)
})

// or get 10 results after a certain date

client.ListCharges(10, '2016-03-11T10:55:47.406144Z')
.then(result => {

    // latest 20 charges
    console.log('charges', result.charges);

    // pagination metadata
    // "meta":{
    //     "pagination":{
    //         "before":"2016-03-11T10:55:47.406144Z",
    //         "after":"2016-08-16T14:44:26.660890Z"
    //     }
    // }
    console.log('mata', result.mata);
})

// OR get 15 results after a certain date

client.ListCharges(15, false, '2016-03-11T10:55:47.406144Z')
.then(result => {

    // latest 20 charges
    console.log('charges', result.charges);

    // pagination metadata
    // "meta":{
    //     "pagination":{
    //         "before":"2016-03-11T10:55:47.406144Z",
    //         "after":"2016-08-16T14:44:26.660890Z"
    //     }
    // }
    console.log('mata', result.mata);
})
```

### Refund functions

Request a refund for a payment with an amount

```js
client.addRefund(chargeId, amount)
.then((charge) => {
    // handle charge
}, (err) => {
    // handle error
});
```

List refunds for a given charge

```js
client.getRefundsForCharge(testCharge.id)
.then((result) => {
    // result is is an object with the refunds as an array under the `refunds` property
    console.log(result.refunds)
});
```

### Customer functions
Information about the Customer data structure can be found [here](https://docs.start.payfort.com/references/api/#the-customer-object)

Add a customer

```js
client.addCustomer({
    name: 'Abdullah', // optional
    email: 'abdullah@msn.com', //required
    card: cardId, // optional; card id string or card object
    description: 'Signed up at the Trade Show in Dec 2014', // optional
})
.then((customer) => {
    // new customer information
});
```

Get a customer

```js
client.getCustomer(customerId)
.then((customer) => {
    // customer information
})
```

Update a customer by passing an object with updated properties

```js
client.updateCustomer(customerId, { name: 'Muhamed' })
.then((customer) => {
    // customer.name === 'Muhamed'
})
```

Delete a customer by id

```js
client.deleteCustomer(customerId)
.then((result) => {
    // result is an object with the deleted customer id and a `deleted` property
    // {
    // "id": "cus_c1cf34bb962d84f39f729ca3a",
    // "deleted": true
    // }
})
```

List all customers with an optional limit, a date before or a date after

```js
client.listCustomers(10 /* beforeDate, afterDate */)
.then((result) => {
    // result.customers is an array of customer information with 10 items at most
})
```

