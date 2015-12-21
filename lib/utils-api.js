var hooman = require('hooman');
var createCommandInterface = hooman.createCommandInterface;

var count = createCommandInterface({
    interpreter: function (cmd, tokens) {
        if (tokens[0] === 'count') {
            var seconds = parseInt(cmd.slice(6));
            return {
                cmd: this.relay,
                args: [seconds, operator],
                certainty: 1.0,
                request: null
            };
        }
    },
    command: function () {
        
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
});

var nextCount = function (done, processId, count) {
    count++;
    if (count < done) {
        socketServer.getConnections().forEach(function (connection) {
            connection.send(JSON.stringify({
                id: processId,
                result: String(count),
                processEnded: false
            }));
        });
        setTimeout(nextCount.bind(null, done, processId, count), 1000);
    } else {
        socketServer.getConnections().forEach(function (connection) {
            connection.send(JSON.stringify({
                id: processId,
                result: String(count),
                processEnded: true
            }));
        });
    }
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

var calc = createCommandInterface({
    interpreter: function (cmd, tokens, operator) {
        if (tokens[0] === 'calc') {
            return {
                cmd: this.interpret.translate,
                args: [operator],
                certainty: 1.0,
                request: null
            };
        }
        return false;
    },
    command: function (operator) {
        operator.done('gooey', 'Calc');
    }
});

var pong = createCommandInterface({
    interpreter: function (cmd, tokens, operator) {
        if (tokens[0] === 'pong') {
            return {
                cmd: this.interpret.translate,
                args: [operator],
                certainty: 1.0,
                request: null
            };
        }
        return false;
    },
    command: function (operator) {
        operator.done('gooey', 'Pong');
    }
});

module.exports = [
    calc,
    pong
];

