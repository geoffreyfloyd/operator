var uuid = require("uuid");
var ajax = require('request');

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

	var wiki = function (res, cmd) {
		ajax({
		//https://en.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(cmd) + '&prop=revisions&rvprop=content&format=json'
		  url: 'https://en.wikipedia.org/w/api.php?action=mobileview&page=' + encodeURIComponent(cmd) + '&sections=all&prop=text&format=json',
		  method: 'GET'
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

		// first serious business

		// wikipedia
		var wikiPattern = new RegExp('wiki', 'i');
		if (wikiPattern.test(request.cmd)) {
			waitForCallback = true;
			wiki(res, request.cmd.slice(5));
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
