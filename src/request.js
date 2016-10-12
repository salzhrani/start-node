const https = require('https');
const fs = require('fs');
const RequestError = require('./errors').RequestError;
const ServerError = require('./errors').ServerError;
const AGENTSTRING = 'StartNode';

const agent = new https.Agent({
	ca: fs.readFileSync('./data/ca-certificates.crt'),
});

module.exports = function request(options, data) {
	return new Promise((resolve, reject) => {
		const requestOptions = Object.assign({
			method: 'GET',
			agent: agent,
			host: 'api.start.payfort.com',
			protocol: 'https:',
			headers: {
				'Content-Type': 'application/json',
				'Connection': 'close',
			},
		}, options);
		if (data) {
			requestOptions.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
		}
		if (!requestOptions.auth) {
			reject(new Error('missing API key'));
		}
		// console.log('data', data);
		// console.log('requestOptions', requestOptions);
		let body = '';
		const request = https.request(requestOptions, (res) => {
			// console.log('request', Object.keys(request).join(',\n'));
			// console.log('request', request._headers);
			res.setEncoding('utf8');
			res.on('data', (chunk) => {
				// console.log('chunk', chunk);
				body += chunk;
			});
			res.on('end', () => {
				let json;
				// console.log('res.statusCode', res.statusCode);
				try {
					json = JSON.parse(body);
				} catch(e) {
					reject(new Error('Malformed response'));
				}
				if (res.statusCode < 300) {
					resolve(json);
					return;
				}
				if (res.statusCode >= 400) {
					reject(new RequestError(json.error));
					return;
				}
				if (res.statusCode >= 500) {
					reject(new ServerError(json.error && json.error.message || 'Payfort server error'));
					return;
				}
				reject(new Error('unexpected statusCode ' + res.statusCode));
			});
		});
		if (data) {
			request.write(JSON.stringify(data));
		}
		request.end();
		request.on('error', reject);
	});
}