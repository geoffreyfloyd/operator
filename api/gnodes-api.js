var hooman = require('hooman');
var createCommandInterface = hooman.createCommandInterface;

module.exports = function(operator) {
        
    var addNode = createCommandInterface({
        
        interpreter: function (cmd, tokens, bridge) {
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
                        args: [kind, name, state, bridge],
                        certainty: 0.5,
                        request: 'kind,name,state'
                    };
                }

                return {
                    cmd: this.interpret.translate,
                    args: [kind, name, state, bridge],
                    certainty: 1.0,
                    request: null
                };
            }
            else {
                return false
            }
        },
        command: function (kind, name, state, bridge) {
            try {
                // SYNTAX: add node doozy.action test-me-out {"name":"test me out", "reason":"test"}
                bridge.operator.db.add(new bridge.operator.db.Gnode(name, kind, state));
                bridge.operator.db.commitChanges();
            }
            catch (e) {
                bridge.fail('Unexpected args');
            }

            bridge.done('text', 'Added node "' + name + '"!');
        }
    });

    var nodes = createCommandInterface({
        interpreter: function (cmd, tokens, bridge) {
            if (tokens[0] === 'nodes') {
                return {
                    cmd: this.interpret.translate,
                    args: [bridge],
                    certainty: 1.0,
                    request: null
                };
            }
            else {
                return false;
            }
        },
        command: function (bridge) {
            // Write all node relationships (and the versions in which they were born) out to the console
            var result = '';
            bridge.operator.db.all.forEach(function (gnode) {
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

            bridge.done('text', result);
        }
    });
    
    operator.registerCommand(addNode);
    operator.registerCommand(nodes);

    /**
     * Set header to tell client that we're
     * sending json data in our response body
     */
    function jsonResponse (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        next();
    }
    
    // URL to retag any gnode
    operator.express.get('/gnodes/api/move/:src/:dest', operator.authenticate, jsonResponse, function (req, res) {
        operator.getDb(function (db) {
            var error;
            try {
                db.move(req.params.src, req.params.dest);
                db.commitChanges();
            }
            catch (e) {
                error = e;
            }
            res.end(JSON.stringify({ error: error}));
        });
    });
};