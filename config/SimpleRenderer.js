var fs = require('fs');
var path = require('path');
var html = fs.readFileSync(path.resolve(__dirname, '../app/simple.html'), 'utf-8');

function SimpleRenderer(options) {
    this.html = html.replace('SCRIPT_URL', options.scriptUrl);
}

SimpleRenderer.prototype.setScriptUrl = function (scriptUrl) {
    this.html = html.replace('SCRIPT_URL', scriptUrl);
};

SimpleRenderer.prototype.render = function (_path, _readItems, callback) {
    callback(null, this.html);
};

SimpleRenderer.prototype.renderWithScript = function (scriptUrl, _path, _readItems, callback) {
    var otfHtml = html.replace('SCRIPT_URL', scriptUrl);
    callback(null, otfHtml);
};

module.exports = SimpleRenderer;
