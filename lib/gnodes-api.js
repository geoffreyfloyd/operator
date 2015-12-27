var hooman = require('hooman');
var createCommandInterface = hooman.createCommandInterface;
var Gnodes = require('gnodes');
var gnodb = null;
Gnodes.open('Geoffrey Floyd', 'geoff.manning.sd@gmail.com', '../../test-db', 'https://github.com/geoffreyfloyd/tdb.git').done(function (db) {
    gnodb = db;
});



var addNode = createCommandInterface({
    
    interpreter: function (cmd, tokens, operator) {
        var pattern = /^add[- ]node /i;
        if (pattern.test(cmd)) {
            var commandArgsIndex = 1;
            if (tokens[0] === 'add') {
                commandArgsIndex = 2;
            }

            try {
                var kind = tokens[commandArgsIndex];
                var name = tokens[commandArgsIndex + 1];
                var state = JSON.parse(tokens[commandArgsIndex + 2]);
            }
            catch (e) {
                return {
                    cmd: this.interpret.translate,
                    args: [kind, name, state, operator],
                    certainty: 0.5,
                    request: 'kind,name,state'
                };
            }

            return {
                cmd: this.interpret.translate,
                args: [kind, name, state, operator],
                certainty: 1.0,
                request: null
            };
        }
        else {
            return false
        }
    },
    command: function (kind, name, state, operator) {
        try {
            // SYNTAX: add node doozy.action test-me-out {"name":"test me out", "reason":"test"}
            gnodb.add(new gnodb.Gnode(name, kind, state));
            gnodb.commitChanges();
        }
        catch (e) {
            operator.fail('Unexpected args');
        }

        operator.done('text', 'Added node "' + name + '"!');
    }
});

var nodes = createCommandInterface({
    interpreter: function (cmd, tokens, operator) {
        if (tokens[0] === 'nodes') {
            return {
                cmd: this.interpret.translate,
                args: [operator],
                certainty: 1.0,
                request: null
            };
        }
        else {
            return false;
        }
    },
    command: function (operator) {
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

        operator.done('text', result);
    }
});

module.exports = [
    addNode,
    nodes
];