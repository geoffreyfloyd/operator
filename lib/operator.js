(function(factory) {
    module.exports = exports = factory(
        require('gnodes')
    );
}(function (Gnodes) {

    var Operator = function (config, express, authenticate, renderer, stats) {
        this.express = express;
        this.authenticate = authenticate;
        this.renderer = renderer;
        this.stats = stats;
        this.db = null;
        this.gooeys = [];
        this.commands = [];
        this.contexts = [];
        this.config = config;
        this.connectToData();
    };
    
    Operator.prototype = {
        connectToData: function (config) {
            if (!this.db) {
                var me = this;
                Gnodes.open(this.config).done(function (db) {
                    me.db = db;
                });     
            }
        },
        createBridge: function (res, req) {
            return new OperatorBridge(this, res, req);  
        },
        registerInterface: function (route, cmd) {
            
        },
        registerCommand: function (kind, route, cmd) {
            // Register route in Express app
            if (route) {
                var expressArgs = [route].concat(Array.prototype.slice.call(arguments, 2));
                this.express[kind](expressArgs);
            }
            
            // Register cmd with operator
            if (cmd) {
                this.commands.push(cmd);
            }
        },
        registerRoute: function (route) {
            var args = Array.prototype.slice.call(arguments, 1);
            if (typeof args[0] !== 'function') {
                this.register(args[0])
            }
        },    
    };

	var OperatorBridge = function (operator, res, req) {
        this.operator = operator;
	    this.res = res;
        this.req = req;
	};

	OperatorBridge.prototype = {
	    done: function (type, result, context) {

	        var ctx = {
	            processId: uuid.v4()
	        };

	        Object.assign(ctx, context);

	        var response = {
	            status: 'OK',
	            date: (new Date()).toISOString(),
	            type: type,
	            result: result,
	            setContext: ctx
	        };
	        this.res.end(JSON.stringify(response));
	    },
	    fail: function (errMsg) {
            var response = {
                status: 'ERR',
                date: (new Date()).toISOString(),
                type: 'text',
                result: errMsg
            };
            this.res.end(JSON.stringify(response));
        }
	};
    
    return Operator;
}));
