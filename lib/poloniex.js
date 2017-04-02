module.exports = (function() {
	var
		crypto  = require('crypto'),
		request = require('request'),
		nonce   = require('nonce')(),
		qs = require("querystring"),

		version         = '0.0.1',
		BASE_URL        = 'https://poloniex.com/',
		PUBLIC_API_URL  = BASE_URL + 'public',
		PRIVATE_API_URL = BASE_URL + 'tradingApi',
		USER_AGENT      = 'poloniex.jazzcript ' + version
	;

	function Poloniex(key, secret) {
		this.getHeaders = function(params) {
			var paramString, signature;

			if (!key || !secret) {
				throw 'Poloniex: Error. API key and secret required';
			}

			paramString = qs.parse(params).query;

			console.log("37gd736g POLONIEX paramString", paramString);

			signature = crypto.createHmac('sha512', secret).update(paramString).digest('hex');

			return {
				Key: key,
				Sign: signature
			};
		};
	}

	Poloniex.STRICT_SSL = true;

	Poloniex.USER_AGENT = USER_AGENT;

	Poloniex.prototype = {
		constructor: Poloniex,

		request: function(options, done) {
			options.headers = options.headers || {};
			options.json = true;
			options.headers['User-Agent'] = Poloniex.USER_AGENT;
			options.strictSSL = Poloniex.STRICT_SSL;

			request(options, function(err, response, body) {
				if (!err && (typeof body === 'undefined' || body === null)){
					err = 'Empty response';
				}

				done(err, body);
			});

			return this;
		},

		executePublic: function(command, params, done) {
			var options;

			if (typeof params === 'function') {
				done = params;
				params = {};
			}

			params = params || {};
			params.command = command;
			options = {
				method: 'GET',
				url: PUBLIC_API_URL,
				qs: params
			};

			options.qs.command = command;
			return this.request(options, done);
		},

		executePrivate: function(command, params, done) {
			var options;

			if (typeof params === 'function') {
				done = params;
				params = {};
			}

			params = params || {};
			params.command = command;
			params.nonce = nonce();

			options = {
				method: 'POST',
				url: PRIVATE_API_URL,
				form: params,
				headers: this.getHeaders(params)
			};

			return this.request(options, done);
		},

		/////
		// PUBLIC METHODS

		returnTicker: function(done) {
			return this.executePublic('returnTicker', done);
		},

		return24hVolume: function(done) {
			return this.executePublic('return24hVolume', done);
		},

		returnOrderBook: function(currencyPair, done) {
			var params = {
				currencyPair: currencyPair
			};

			return this.executePublic('returnOrderBook', params, done);
		},

		returnChartData: function(currencyPair, period, start, end, done) {
			var params = {
				currencyPair: currencyPair,
				period: period,
				start: start,
				end: end
			};

			return this.executePublic('returnChartData', params, done);
		},

		returnCurrencies: function(done) {
			return this.executePublic('returnCurrencies', done);
		},

		returnLoanOrders: function(currency, done) {
			return this.executePublic('returnLoanOrders', {currency: currency}, done);
		},

		/////
		// PRIVATE METHODS

		returnBalances: function(done) {
			return this.executePrivate('returnBalances', {}, done);
		},

		returnCompleteBalances: function(done) {
			return this.executePrivate('returnCompleteBalances', {}, done);
		},

		returnDepositAddresses: function(done) {
			return this.executePrivate('returnDepositAddresses', {}, done);
		},

		generateNewAddress: function(currency, done) {
			return this.executePrivate('returnDepositsWithdrawals', {currency: currency}, done);
		},

		returnDepositsWithdrawals: function(start, end, done) {
			return this.executePrivate('returnDepositsWithdrawals', {start: start, end: end}, done);
		},

		returnOpenOrders: function(currencyPair, done) {
			var params = {
				currencyPair: currencyPair,
			};

			return this.executePrivate('returnOpenOrders', params, done);
		},

		returnTradeHistory: function(currencyPair, done) {
			var params = {
				currencyPair: currencyPair
			};

			return this.executePrivate('returnTradeHistory', params, done);
		},

		returnOrderTrades: function(orderNumber, done) {
			var params = {
				orderNumber: orderNumber
			};

			return this.executePrivate('returnOrderTrades', params, done);
		},

		buy: function(currencyPair, rate, amount, done) {
			var params = {
				currencyPair: currencyPair,
				rate: rate,
				amount: amount
			};

			return this.executePrivate('buy', params, done);
		},

		sell: function(currencyPair, rate, amount, done) {
			var params = {
				currencyPair: currencyPair,
				rate: rate,
				amount: amount
			};

			return this.executePrivate('sell', params, done);
		},

		cancelOrder: function(currencyPair, orderNumber, done) {
			var params = {
				currencyPair: currencyPair,
				orderNumber: orderNumber
			};

			return this.executePrivate('cancelOrder', params, done);
		},

		moveOrder: function(orderNumber, rate, amount, done) {
			var params = {
				orderNumber: orderNumber,
				rate: rate,
				amount: amount ? amount : null
			};

			return this.executePrivate('moveOrder', params, done);
		},

		withdraw: function(currency, amount, address, done) {
			var params = {
				currency: currency,
				amount: amount,
				address: address
			};

			return this.executePrivate('withdraw', params, done);
		},

		returnFeeInfo: function(done) {
			return this.executePrivate('returnFeeInfo', {}, done);
		},

		returnAvailableAccountBalances: function(account, done) {
			var options = {};
			
			if (account) {
				options.account = account;
			}
			return this.executePrivate('returnAvailableAccountBalances', options, done);
		},

		returnTradableBalances: function(done) {
			return this.executePrivate('returnTradableBalances', {}, done);
		},

		transferBalance: function(currency, amount, fromAccount, toAccount, done) {
			var params = {
				currency: currency,
				amount: amount,
				fromAccount: fromAccount,
				toAccount: toAccount
			};

			return this.executePrivate('transferBalance', params, done);
		},

		returnMarginAccountSummary: function(done) {
			return this.executePrivate('returnMarginAccountSummary', {}, done);
		},

		marginBuy: function(currencyPair, rate, amount, lendingRate, done) {
			var params = {
				currencyPair: currencyPair,
				rate: rate,
				amount: amount,
				lendingRate: lendingRate ? lendingRate : null
			};

			return this.executePrivate('marginBuy', params, done);
		},

		marginSell: function(currencyPair, rate, amount, lendingRate, done) {
			var params = {
				currencyPair: currencyPair,
				rate: rate,
				amount: amount,
				lendingRate: lendingRate ? lendingRate : null
			};

			return this.executePrivate('marginSell', params, done);
		},

		getMarginPosition: function(currencyPair, done) {
			var params = {
				currencyPair: currencyPair
			};

			return this.executePrivate('getMarginPosition', params, done);
		},

		closeMarginPosition: function(currencyPair, done) {
			var params = {
				currencyPair: currencyPair
			};

			return this.executePrivate('closeMarginPosition', params, done);
		},

		createLoanOffer: function(currency, amount, duration, autoRenew, lendingRate, done) {
			var params = {
				currency: currency,
				amount: amount,
				duration: duration,
				autoRenew: autoRenew,
				lendingRate: lendingRate
			};

			return this.executePrivate('createLoanOffer', params, done);
		},

		cancelLoanOffer: function(orderNumber, done) {
			var params = {
				orderNumber: orderNumber
			};

			return this.executePrivate('cancelLoanOffer', params, done);
		},

		returnOpenLoanOffers: function(done) {
			return this.executePrivate('returnOpenLoanOffers', {}, done);
		},

		returnActiveLoans: function(done) {
			return this.executePrivate('returnActiveLoans', {}, done);
		},

		toggleAutoRenew: function(orderNumber, done) {
			return this.executePrivate('toggleAutoRenew', {orderNumber: orderNumber}, done);
		}

	};

	// Backwards Compatibility
	Poloniex.prototype.getTicker = Poloniex.prototype.returnTicker;
	Poloniex.prototype.get24hVolume = Poloniex.prototype.return24hVolume;
	Poloniex.prototype.getOrderBook = Poloniex.prototype.returnOrderBook;
	Poloniex.prototype.getTradeHistory = Poloniex.prototype.returnChartData;
	Poloniex.prototype.myBalances = Poloniex.prototype.returnBalances;
	Poloniex.prototype.myOpenOrders = Poloniex.prototype.returnOpenOrders;
	Poloniex.prototype.myTradeHistory = Poloniex.prototype.returnTradeHistory;

	return Poloniex;
})();
