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

var f = {
    start: function () {
        return {
            id: uuid.v4(),
            cmd: '',
            date: null,
            listening: true,
            response: null
        };
    },
    send: function (request, callback) {
        var req;
        for (var i = 0; i < requests.length; i++) {
            if (requests[i].id === request.id) {
                req = requests[i];
            }
        }

        req.cmd = request.cmd;
        req.date = new Date();
        req.listening = false;

        var newRequest = f.start();
        requests.push(newRequest);

        // notify subscribers
        callbacks.map(function (cb) {
            cb([req, newRequest]);
        });

        api.sendRequest(req, callback);
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

        var currentRequest = requests[requests.length - 1];

        Object.assign(currentRequest, {
            cmd: repeatRequest.cmd,
            listening: false
        });

        // notify subscribers
        callbacks.map(function (cb) {
            cb([currentRequest]);
        });

        f.send(currentRequest, function () {
            // notify subscribers
            callbacks.map(function (cb) {
                cb([currentRequest]);
            });
        });
    },
    get: function () {
        return requests;
    },
    subscribe: function (callback) {
        callbacks.push(callback);
    }
};

module.exports = exports = f;
var welcome = f.start();
welcome.listening = false;
welcome.response = {
    status: 'OK',
    date: new Date(),
    result: 'WebPrompt\r\nHoomanLogic ©2015',
    type: 'text'
};
var requests = [welcome, f.start()];
