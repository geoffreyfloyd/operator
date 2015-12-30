var hooman = require('hooman');
var createCommandInterface = hooman.createCommandInterface;

var wiki = createCommandInterface({
    interpreter: function (cmd, tokens, operator) {
        if (tokens[0] === 'wiki') {
            var query = cmd.slice(5);
            return {
                cmd: this.interpret.translate,
                args: [query, operator],
                certainty: 1.0,
                request: null
            };
        }
        return false;
    },
    command: function (query, operator) {
        ajax({
            method: 'GET',
            url: 'https://en.wikipedia.org/w/api.php?action=mobileview&page=' + encodeURIComponent(query) + '&sections=all&prop=text&format=json'
        }, function (err, rsp, body) {
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
                operator.done('html', html);
            }
            else {
                operator.fail(err);
            }
        });
    }
});

module.exports = [wiki];