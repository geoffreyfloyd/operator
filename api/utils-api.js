var hooman = require('hooman');
var createCommandInterface = hooman.createCommandInterface;
var those = require('hl-common-js/src/those');

module.exports = function(operator) {
            
    var count = createCommandInterface({
        interpreter: function (cmd, tokens, bridge) {
            if (tokens[0] === 'count') {
                var seconds = parseInt(cmd.slice(6));
                return {
                    cmd: this.interpret.translate,
                    args: [seconds, bridge],
                    certainty: 1.0,
                    request: null
                };
            }
        },
        command: function (seconds, bridge) {
            var processId = operator.newId();
            setTimeout(nextCount.bind(null, seconds, processId, 0), 1000);
            bridge.done('text', 'OK!', { processId: processId });
        }
    });

    var nextCount = function (done, processId, count) {
        count++;
        if (count < done) {
            operator.socketServer.getConnections().forEach(function (connection) {
                connection.send(JSON.stringify({
                    id: processId,
                    result: String(count),
                    processEnded: false
                }));
            });
            setTimeout(nextCount.bind(null, done, processId, count), 1000);
        } else {
            operator.socketServer.getConnections().forEach(function (connection) {
                connection.send(JSON.stringify({
                    id: processId,
                    result: String(count),
                    processEnded: true
                }));
            });
        }
    };

    var remind = createCommandInterface({
        commands: ['remind', 'reminder'],
        contexts: ['open', 'start', 'do'],
        interpreter: function (cmd, tokens, bridge) {
            // TODO || bridge.identifyJargon(['calc'], tokens) > -1
            //         checks 'calc' against a user-aliases list
            if (those(tokens).hasAny(this.commands)) {
                return {
                    cmd: this.interpret.translate,
                    args: [tokens, bridge],
                    certainty: 1.0,
                    request: null
                };
            }
            return false;
        },
        command: function (tokens, bridge) {
            var processId = operator.newId();

            setTimeout(remindTimeElapse.bind(null, processId, tokens, bridge), parseInt(tokens[1]) * 1000);
            
            bridge.done('text', 'OK!', { processId: processId });
        }
    });
    
    var remindTimeElapse = function (processId, tokens, bridge) {
        operator.socketServer.getConnections().forEach(function (connection) {
            connection.send(JSON.stringify({
                id: processId,
                result: tokens.length > 2 ? tokens.slice(2).join(' ') : 'BEEP!',
                processEnded: true
            }));
        });
    };

    var calc = createCommandInterface({
        commands: ['calc', 'calculator'],
        contexts: ['open', 'start'],
        interpreter: function (cmd, tokens, bridge) {
            // TODO || bridge.identifyJargon(['calc'], tokens) > -1
            //         checks 'calc' against a user-aliases list
            if (those(tokens).hasAny(this.commands)) {
                return {
                    cmd: this.interpret.translate,
                    args: [bridge],
                    certainty: 1.0,
                    request: null
                };
            }
            return false;
        },
        command: function (bridge) {
            bridge.done('gooey', 'Calc');
        }
    });

    var pong = createCommandInterface({
        commands: ['pong', 'ping-pong'],
        contexts: ['play', 'game'],
        interpreter: function (cmd, tokens, bridge) {
            if (those(tokens).hasAny(this.commands)) {
                return {
                    cmd: this.interpret.translate,
                    args: [bridge],
                    certainty: 1.0,
                    request: null
                };
            }
            return false;
        },
        command: function (bridge) {
            bridge.done('gooey', 'Pong');
        }
    });

    var game = createCommandInterface({
        commands: ['musheen', 'rain'],
        contexts: ['play', 'game'],
        interpreter: function (cmd, tokens, bridge) {
            if (those(tokens).hasAny(this.commands)) {
                return {
                    cmd: this.interpret.translate,
                    args: [bridge],
                    certainty: 1.0,
                    request: null
                };
            }
            return false;
        },
        command: function (bridge) {
            bridge.done('gooey', 'Game');
        }
    });
    
    operator.registerCommand(count);
    operator.registerCommand(remind);
    operator.registerCommand(calc);
    operator.registerCommand(pong);
    operator.registerCommand(game);
};

