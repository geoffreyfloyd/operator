var uuid = require('uuid');
var ajax = require('request');
var socketServer = require('./socket-server');
var hooman = require('hooman');
var createCommandInterface = hooman.createCommandInterface;
var tokenize = hooman.tokenize;

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

	var commands = [];
	commands = commands.concat(require('./gnodes-api')).concat(require('./research-api')).concat(require('./utils-api'));

	var OperatorBridge = function (res) {
	    this.res = res;
	};

	OperatorBridge.prototype = {
	    done: function (type, result, context) {

	        var ctx = {
	            processId: uuid.v4()
	        };

	        Object.assign(ctx, context);

	        var response = {
	            status: 'OK',
	            date: (new Date()).toISOString(),
	            type: type,
	            result: result,
	            setContext: ctx
	        };
	        this.res.end(JSON.stringify(response));
	    },
	    fail: function (errMsg) {
            var response = {
                status: 'ERR',
                date: (new Date()).toISOString(),
                type: 'text',
                result: errMsg
            };
            this.res.end(JSON.stringify(response));
        }
	};

    /**
     * Handle a request from the client web prompt
     */
	app.post('/_/cmd/*', function(req, res) {
	    /**
         * Set header to tell client that we're
         * sending json data in our response body
         */
		res.setHeader('Content-Type', 'application/json');

        // Set variables
		var cmd = req.body.cmd;
		var tokens = tokenize(cmd);
		var interpreterResponses = [];
		var operator = new OperatorBridge(res);

	    /**
         * Let all interpreters decide if they recognize this command
         * and add all interested responses to array
         */
		commands.forEach(function (command) {
		    var interpreterResponse = command.interpret(cmd, tokens, operator); 
		    if (interpreterResponse) {
		        interpreterResponses.push(interpreterResponse)
		    }
		});

		if (interpreterResponses.length === 0) {
		    /**
             * None of the command interpretors recognized this command
             */
		    operator.fail('Pardon? My apologies, but i do not understand.');
		}
		else if (interpreterResponses.length === 1 && interpreterResponses[0].certainty === 1.0) {
		    /**
             * Only one interpreter recognized it and does not need
             * more input in order to respond to the request
             */
		    interpreterResponses[0].cmd.apply(null, interpreterResponses[0].args);
		}
		else {
		    // TODO: We have some figuring out to do
            console.log('Not sure what to do');
        }

	});
};
