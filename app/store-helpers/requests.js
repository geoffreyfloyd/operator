import $ from 'jquery/dist/jquery';
import uuid from 'uuid';

var openWidgets = [];
var callbacks = [];

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

var wrapRequest = function (cmd) {
    return {
        id: uuid.v4(),
        date: (new Date()).toISOString(),
        cmd: cmd,
        response: null
    };
}

var f = {
    send: function (cmd, callback) {

        if (!cmd) {
            return;
        }

        var request = wrapRequest(cmd);
        requests.push(request);

        // notify subscribers
        f.notify(request);

        api.sendRequest(request, function (request) {
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
    get: function () {
        return requests;
    },
    subscribe: function (callback, id) {
        callbacks.push({
            callback: callback,
            id: id
        });
    },
    notify: function (request) {
        // notify subscribers
        callbacks.map(function (cb) {
            if (!cb.id || request.id === cb.id) {
                cb.callback(request);
            }
        });
    }
};

module.exports = exports = f;
var welcome = wrapRequest('');
welcome.response = {
    status: 'OK',
    date: new Date(),
    result: 'WebPrompt\r\nHoomanLogic ©2015',
    type: 'text'
};
var requests = [welcome];
