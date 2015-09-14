var uuid = require("uuid");
var ajax = require('request');
var socketServer = require("./socket-server");

module.exports = function(app) {

	// REST APIs
	// Note that there is no security in this example
	// Make sure your production server handles requests better!

	var getFunResponse = function (cmd) {
		cmd = cmd.toLowerCase();

		var greeting = new RegExp('h[ae]llo|hi|hey|howdy', 'i');
		if (greeting.test(cmd)) {
			return {
				status: 'OK',
				date: (new Date()).toISOString(),
				type: 'text',
				result: 'Hi, how can i help you?'
			};
		}

		if (cmd === 'what\'s up') {
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

	app.post("/_/cmd/*", function(req, res) {
		res.setHeader("Content-Type", "application/json");

		var response = null;
		var request = req.body;
		var waitForCallback = false;

		var tokens = request.cmd.split(' ');

		// first serious business

		// wikipedia
		if (!waitForCallback) {
			var wikiPattern = new RegExp('wiki', 'i');
			if (wikiPattern.test(request.cmd)) {
				waitForCallback = true;
				wiki(res, request.cmd.slice(5))
			}
		}

		if (response === null) {
			response = getReminder(tokens);
		}

		if (response === null) {
			response = getCounter(request.cmd);
		}

		// nothing actionable? let's have fun
		if (response === null) {
			response = getFunResponse(request.cmd);
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
