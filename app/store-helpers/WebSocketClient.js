var W3CWebSocket = require('websocket').w3cwebsocket;

var client = new W3CWebSocket('ws://localhost:8181/', 'echo-protocol');

client.onerror = function(err) {
    console.log('Connection Error');
};

client.onopen = function(res) {
    console.log('WebSocket Client Connected');
};

client.onclose = function() {
    console.log('WebSocket Client Closed');
};

client.onmessage = function(e) {
    callbacks.map(function (cb) {
        cb(e.data);
    });
    if (typeof e.data === 'string') {
        console.log("Received: '" + e.data + "'");
    }
};

var callbacks = [];

module.exports = exports = {
    client: client,
    onmessage: function (callback) {
        callbacks.push(callback)
    }
};
