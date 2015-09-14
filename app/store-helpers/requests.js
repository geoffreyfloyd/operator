import $ from 'jquery/dist/jquery';
import uuid from 'uuid';
import WebSocketClient from "./WebSocketClient";

var openWidgets = [];
var callbacks = [];
var requests = [];

var api = {
    sendRequest: function (request, callback) {
        $.ajax({
            context: this,
            url: 'http://localhost:8080/_/cmd/',
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(request),
            dataType: "json"
        }).done(function (response) {
            request.response = response;
            callback(request);
        }).fail(function (err) {
            request.response = {
                status: 'ERR',
                date: (new Date()).toISOString(),
                result: err.statusText,
                type: 'text'
            };
            callback(request);
        });
    }
};

var handleSocketMessage = function (data) {

    data = JSON.parse(data);
    var request = null;
    requests.map(function (req) {
        if (req.context && req.context.processId === data.id) {
            request = req;
        }
    });

    if (request === null) {
        return;
    }

    if (data.result === null || data.processEnded) {
        // process ended
        request.context.processId = void 0;
    }

    if (data.result !== null) {
        if (request.response === null) {
            request.response = {};
        }
        if (typeof request.response.result === 'string' && typeof data.result === 'string') {
            request.response.result += '\r\n' + data.result;
        }
        else {
            request.response.result = data.result;
        }
    }

    f.notify(request);
}

WebSocketClient.onmessage(handleSocketMessage);

var wrapRequest = function (cmd, sessionId) {
    return {
        id: uuid.v4(),
        sessionId: sessionId,
        context: {},
        date: (new Date()).toISOString(),
        cmd: cmd,
        response: null
    };
}

var f = {
    send: function (cmd, sessionId, callback) {

        if (!cmd) {
            return;
        }

        var request = wrapRequest(cmd, sessionId);
        requests.push(request);

        // notify subscribers
        f.notify(request);

        // A managed type of object.assign to
        // add logic based on property name being updated
        var assignFilter = function (root, other, on) {
            for (var prop in other) {
                if (other.hasOwnProperty(prop)) {
                    if (!root.hasOwnProperty(prop) || root[prop] != other[prop]) {
                        if (on(prop)) {
                            root[prop] = other[prop];
                        }
                    }
                }
            }
        }

        api.sendRequest(request, function (request) {
            if (request.response.hasOwnProperty('setContext')) {
                var context = request.response.setContext;
                //request.response.setContext = void 0;

                // If we're getting a process id, then let's
                // spawn a new session
                assignFilter(request.context, context, function(prop) {
                    if (prop === 'processId') {

                        request.sessionId = uuid.v4();
                    }
                    return true;
                });
            }

            // notify subscribers
            f.notify(request);

            if (callback) {
                callback(request);
            }
        });
    },
    repeat: function (id) {
        var i;
        var repeatRequest;
        var currentRequest;

        for (i = 0; i < requests.length; i++) {
            if (requests[i].id === id) {
                repeatRequest = requests[i];
                break;
            }
        }

        f.send(repeatRequest.cmd, function (request) {
            // notify subscribers
            f.notify(request);
        })
    },
    getRequests: function (sessionId) {
        var filtered = [];
        requests.map(function (request) {
            if (request.sessionId === sessionId) {
                filtered.push(request);
            }
        });
        return filtered;
    },
    closeSession: function (sessionId) {
        var filtered = [];
        requests.map(function (request) {
            if (request.sessionId !== sessionId) {
                filtered.push(request);
            }
        });
        requests = filtered;
        f.notify(sessionId);

        if (requests.length === 0) {
            f.new();
        }
    },
    getSessionIds: function () {
        var sessionIds = [];
        requests.map(function (request) {
            if (sessionIds.indexOf(request.sessionId) === -1) {
                sessionIds.push(request.sessionId);
            }
        });
        return sessionIds;
    },
    subscribe: function (callback, id) {
        callbacks.push({
            callback: callback,
            id: id
        });
    },
    new: function () {
        var welcome = wrapRequest('', uuid.v4());
        welcome.response = {
            status: 'OK',
            date: new Date(),
            result: '', //WebPrompt\r\nby HoomanLogic
            type: 'text'
        };
        requests.push(welcome);
        f.notify(welcome);
    },
    notify: function (request) {
        // notify subscribers
        callbacks.map(function (cb) {
            if (!cb.id || request.id === cb.id || request.sessionId === cb.id) {
                cb.callback(request);
            }
        });
    }
};

f.new();

module.exports = exports = f;
