(function(factory) {
    module.exports = exports = factory(
        require('gnodes'),
        require('uuid')
    );
}(function (Gnodes, uuid) {

    var Operator = function (config, express, socketServer, authenticate, renderer, stats) {
        this.express = express;
        this.socketServer = socketServer;
        this.authenticate = authenticate;
        this.renderer = renderer;
        this.stats = stats;
        this.db = null;
        this.gooeys = [];
        this.commands = [];
        this.contexts = [];
        this.config = config;
        
        this.connectToData();
        this.configurePassport();
    };
    
    Operator.prototype = {
        newId: function () {
            return uuid.v4();  
        },
        configurePassport: function () {
            
            if (!this.config || !this.config.passport) {
                return;
            }
            
            //
            var passport = require('passport');
            
            // Setup Sessions and Passport OAuth
            this.express.use(passport.initialize());
            this.express.use(passport.session());
                        
            // Passport session setup.
            //   To support persistent login sessions, Passport needs to be able to
            //   serialize users into and deserialize users out of the session.  Typically,
            //   this will be as simple as storing the user ID when serializing, and finding
            //   the user by ID when deserializing.  However, since this example does not
            //   have a database of user records, the complete Google profile is
            //   serialized and deserialized.
            var users = [];
            passport.serializeUser(function(user, done) {
                done(null, user);
            });

            passport.deserializeUser(function(obj, done) {
                done(null, obj);
            });

            var google = this.config.passport.google;
            if (google) {
                var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
                passport.use(new GoogleStrategy({
                    clientID: google.id,
                    clientSecret: google.secret,
                    callbackURL: google.callback
                }, function(accessToken, refreshToken, profile, done) {
                    // asynchronous verification, for effect...
                    process.nextTick(function () {
                        // To keep the example simple, the user's Google profile is returned to
                        // represent the logged-in user.  In a typical application, you would want
                        // to associate the Google account with a user record in your database,
                        // and return that user instead.
                        //myself = profile;
                        var user;
                        
                        // for (var i = 0; i < users.length; i++) {
                        //     if (users[i].token === accessToken) {
                        //         user = users[i];
                        //     }
                        // }
                        
                        // if (!user) {
                        user = {
                            profileUrl: profile.photos.length > 0 ? profile.photos[0].value : null,
                            userName: profile.displayName,
                            provider: 'google',
                            providerId: profile.id
                        };
                        //     users.push(user);
                        // }
                        
                        return done(null, user);
                        
                        // User.findOrCreate({ googleId: profile.id }, function (err, user) {
                        //    return done(err, user);
                        // });
                    });
                }));
                
                // GET /auth/google
                //   Use passport.authenticate() as route middleware to authenticate the
                //   request.  The first step in Google authentication will involve
                //   redirecting the user to google.com.  After authorization, Google
                //   will redirect the user back to this application at /auth/google/callback
                this.express.get('/auth/google',
                passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }),
                function (req, res) {
                    // The request will be redirected to Google for authentication, so this
                    // function will not be called.
                });

                // GET /auth/google/callback
                //   Use passport.authenticate() as route middleware to authenticate the
                //   request.  If authentication fails, the user will be redirected back to the
                //   login page.  Otherwise, the primary route function function will be called,
                //   which, in this example, will redirect the user to the home page.
                this.express.get('/signin-google', 
                passport.authenticate('google', { failureRedirect: '/login' }),
                function(req, res) {
                    // Here user exists
                    // res.set('token', req.user.token);
                    res.redirect('/');
                });
            }

        },
        getDb: function (callback) {
            if (this.db) {
                callback(this.db)
            }
            else {
                this.dbConnectRequests = this.dbConnectRequests || [];
                this.dbConnectRequests.push(callback);
            }
        },
        onConnected: function () {
            if (this.dbConnectRequests && this.dbConnectRequests.length) {
                while (this.dbConnectRequests.length > 0) {
                    var request = this.dbConnectRequests.splice(0, 1)[0];
                    request(this.db);
                }
            }  
        },
        connectToData: function (config) {
            if (!this.db) {
                var me = this;
                Gnodes.open(this.config).done(function (db) {
                    if (me.dbReady) {
                        me.dbReady();
                    }
                    me.db = db;
                    me.onConnected();
                });     
            }
        },
        createBridge: function (req, res) {
            return new OperatorBridge(this, req, res);  
        },
        // registerInterface: function (route, cmd) {
            
        // },
        registerCommand: function (kind, route, cmd) {
            // if (typeof kind === 'object') {
                // Register cmd with operator
                if (kind) {
                    this.commands.push(kind);
                }                          
            // }
            // else {
            //     // Register route in Express app
            //     if (route) {
            //         var expressArgs = [route].concat(Array.prototype.slice.call(arguments, 2));
            //         this.express[kind](expressArgs);
            //     }
                
            //     // Register cmd with operator
            //     if (cmd) {
            //         this.commands.push(cmd);
            //     }                
            // }
        },
        // registerRoute: function (route) {
        //     var args = Array.prototype.slice.call(arguments, 1);
        //     if (typeof args[0] !== 'function') {
        //         this.register(args[0])
        //     }
        // },    
    };

	var OperatorBridge = function (operator, req, res) {
        this.operator = operator;
        this.req = req;
        this.res = res;
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
