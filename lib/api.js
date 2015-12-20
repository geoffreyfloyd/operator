var uuid = require('uuid');
var ajax = require('request');
var socketServer = require('./socket-server');

module.exports = function(app) {

	// REST APIs
	// Note that there is no security in this example
	// Make sure your production server handles requests better!
	var getFunResponse = function (cmd) {
		cmd = cmd.toLowerCase();

		var greeting = /h[ae]llo|hi|hey|howdy/i;
		if (greeting.test(cmd)) {
			return {
				status: 'OK',
				date: (new Date()).toISOString(),
				type: 'text',
				result: 'Hi, how can i help you?'
			};
		}

		greeting = /^what\'s up/i;
		if (greeting.test(cmd)) {
			return {
				status: 'OK',
				date: (new Date()).toISOString(),
				type: 'text',
				result: 'Just byting into life one chunk at a time.'
			};
		}

		return null;
	};

	var nextCount = function (done, processId, count) {

		count++;
		if (count < done) {
			socketServer.getConnections().map(function (connection) {
				connection.send(JSON.stringify({
					id: processId,
					result: String(count),
					processEnded: false
				}));
			});
			setTimeout(nextCount.bind(null, done, processId, count), 1000);
		} else {
			socketServer.getConnections().map(function (connection) {
				connection.send(JSON.stringify({
					id: processId,
					result: String(count),
					processEnded: true
				}));
			});
		}
	};

	var tokenize = function (cmd) {
	    var tokenPattern = /\{([^\}]*)\}|[^\s"']+|"([^"]*)"|'([^']*)/g;
	    var tokens = cmd.match(tokenPattern);
	    var match;

	    tokens = tokens.map(function (token) {
	        return stripQuotes(token);
	    });

	    console.log(tokens);
	    return tokens;
	};

	var stripQuotes = function (token) {
	    var quotes = ['"', "'"];
	    if (token !== null && token.length > 2 && quotes.indexOf(token.slice(0, 1)) > -1 && quotes.indexOf(token.slice(-1)) > -1 && token.slice(0, 1) === token.slice(-1)) {
	        return token.slice(1, token.length - 1);
	    }
	    else {
	        return token;
	    }
	};

	var getCounter = function (cmd) {

		var pattern = new RegExp('count', 'i');
		if (pattern.test(cmd)) {

			var seconds = parseInt(cmd.slice(6));
			//var done = new Date();
			//done.setSeconds(done.getSeconds() + seconds);
			var processId = uuid.v4();

			setTimeout(nextCount.bind(null, seconds, processId, 0), 1000);
			return {
				status: 'OK',
				date: (new Date()).toISOString(),
				type: 'text',
				result: 'OK!',
				setContext: {
					processId: processId
				}
			};
		}


		return null;
	};

	var getReminder = function (cmdTokens) {

		var pattern = new RegExp('remind', 'i');
		if (pattern.test(cmdTokens[0])) {

			var processId = uuid.v4();

			setTimeout(function () {
				socketServer.getConnections().map(function (connection) {
					connection.send(JSON.stringify({
						id: processId,
						result: cmdTokens.length > 2 ? cmdTokens.slice(2).join(' ') : 'BEEP!',
						processEnded: true
					}));
				});
			}, parseInt(cmdTokens[1]) * 1000);

			return {
				status: 'OK',
				date: (new Date()).toISOString(),
				type: 'text',
				result: 'OK!',
				setContext: {
					processId: processId
				}
			};
		}

		return null;

	};

	var wiki = function (res, query) {
		ajax({
			method: 'GET',
			url: 'https://en.wikipedia.org/w/api.php?action=mobileview&page=' + encodeURIComponent(query) + '&sections=all&prop=text&format=json'
		}, function(err, rsp, body) {
			var response;
			if (!err) {
				var html = 'There was a problem understanding Wikipedia\'s response';
				body = JSON.parse(body)
				if (body && body.mobileview && body.mobileview.sections && body.mobileview.sections[0].text) {
					html = body.mobileview.sections[0].text;
					var pattern = new RegExp('class="[^"]*"', 'g');
					html = html.replace(pattern, '');
					pattern = new RegExp('style="[^"]*"', 'g');
					html = html.replace(pattern, '');
				}
				response = {
					status: 'OK',
					date: (new Date()).toISOString(),
					type: 'html',
					result: html
				};
			}
			else {
				response = {
					status: 'ERR',
					date: (new Date()).toISOString(),
					type: 'text',
					result: err
				};

			}
			res.end(JSON.stringify(response));
		});
	};

	var commands = [];
	commands = commands.concat(require('./gnodes-api')).concat([getCounter, getFunResponse]);

	app.post('/_/cmd/*', function(req, res) {
		res.setHeader('Content-Type', 'application/json');

		var response = null;
		var request = req.body;
		var waitForCallback = false;

		var tokens = tokenize(request.cmd);

		// first serious business
		if (response === null && tokens[0] === 'calc') {
			response = {
				status: 'OK',
				date: (new Date()).toISOString(),
				type: 'gooey',
				result: 'Calc',
				setContext: {
					processId: uuid.v4()
				}
			};
		}

		if (response === null && tokens[0] === 'pong') {
			response = {
				status: 'OK',
				date: (new Date()).toISOString(),
				type: 'gooey',
				result: 'Pong',
				setContext: {
					processId: uuid.v4()
				}
			};
		}

		// wikipedia
		if (!waitForCallback) {
			if (tokens[0] === 'wiki') {
				waitForCallback = true;
				wiki(res, tokens.slice(1).join(' '));
			}
		}

		var commandIndex = -1;
		while (response === null && ++commandIndex !== commands.length) {
		    response = commands[commandIndex](request.cmd, tokens);
		}

		// can't think of anything fun to say? return an error
		if (response === null) {
			response = {
				status: 'ERR',
				date: (new Date()).toISOString(),
				type: 'text',
				result: 'Pardon? My apologies, but i do not understand.'
			};
		}

		if (!waitForCallback) {
			res.end(JSON.stringify(response));
		}

	});
};
