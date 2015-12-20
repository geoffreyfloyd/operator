var Gnodes = require('../../doozy-data/src/gnodes.js');
var gnodb = null;
Gnodes.open('Geoffrey Floyd', 'geoff.manning.sd@gmail.com', '../../test-db', 'https://github.com/geoffreyfloyd/tdb.git').done(function (db) {
    gnodb = db;
});

module.exports = [
    function (cmd, tokens) {
        var pattern = /^add[- ]node /i;
        if (pattern.test(cmd)) {
            var processId = uuid.v4();

            // SYNTAX: add node doozy.action test-me-out {"name":"test me out", "reason":"test"}
            var kind = tokens[0];
            var name = tokens[1];
            var state = JSON.parse(tokens[2]);
            var node1 = gnodb.add(new gnodb.Gnode(name, kind, state));
            gnodb.commitChanges();

            return {
                status: 'OK',
                date: (new Date()).toISOString(),
                type: 'text',
                result: '# ADDED ACTION "' + name + '"!',
                setContext: {
                    processId: processId
                }
            };
        }

        return null;
    },
    function (cmd) {

        var pattern = /^nodes /i;
        if (pattern.test(cmd)) {
            var processId = uuid.v4();

            // Write all node relationships (and the versions in which they were born) out to the console
            var result = '';
            gnodb.all.forEach(function (gnode) {
                result += gnode.kind + ':' + gnode.tag + ' is at Version ' + gnode.version + ':' + JSON.stringify(gnode.state).replace(/,/g, ',\r\n    ').replace(/\{/g, '{\r\n').replace(/\}/g, '\r\n}') + '\r\n';
                gnode.children().forEach(function (gnapse) {
                    result += '- is parent of ' + gnapse.getTarget().kind + ':' + gnapse.getTarget().tag + ' as of Versions ' + gnapse.originVersion + ':' + gnapse.targetVersion + '\r\n';
                });
                gnode.siblings().forEach(function (gnapse) {
                    result += '- is sibling of ' + gnapse.getTarget().kind + ':' + gnapse.getTarget().tag + ' as of Versions ' + gnapse.originVersion + ':' + gnapse.targetVersion + '\r\n';
                });
                gnode.parents().forEach(function (gnapse) {
                    result += '- is child of ' + gnapse.getTarget().kind + ':' + gnapse.getTarget().tag + ' as of Versions ' + gnapse.originVersion + ':' + gnapse.targetVersion + '\r\n';
                });
            });

            return {
                status: 'OK',
                date: (new Date()).toISOString(),
                type: 'text',
                result: result,
                setContext: {
                    processId: processId
                }
            };
        }


        return null;
    }
];