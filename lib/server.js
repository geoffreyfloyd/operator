module.exports = function(options) {

	var express = require('express');
    var cookieParser = require('cookie-parser');
	var bodyParser = require('body-parser');
    var session = require('express-session')
    var methodOverride = require('method-override')
	var path = require('path');
    var passport = require('passport')
    var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

	// require the page rendering logic
	var Renderer = options.prerender ?
		require('../build/prerender/main.js') :
		require('../config/SimpleRenderer.js');

	// load bundle information from stats
	var stats = require('../build/stats.json');

	var publicPath = stats.publicPath;

	var renderer = new Renderer({
		styleUrl: options.separateStylesheet && (publicPath + 'main.css?' + stats.hash),
		scriptUrl: publicPath + [].concat(stats.assetsByChunkName.main)[0],
		commonsUrl: publicPath + [].concat(stats.assetsByChunkName.commons)[0]
	});

    /**
     * Create and configure express server
     */
	var app = express();

    // Setup JSON Body Parsing
    // app.use(express.logger());
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(methodOverride());
    app.use(session({
        resave: false,
        saveUninitialized: false,
        secret: 'sab13s4cyootp00dle'
    }));
    
    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
        next();
    });
    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
        next();
    });
 
    app.set('views', path.join(__dirname, '..', 'app', 'views'));
    app.set('view engine', 'jade');
    
	// Setup static assets
	app.use('/_assets', express.static(path.join(__dirname, '..', 'build', 'public'), {
		maxAge: '200d' // We can cache them as they include hashes
	}));
	app.use('/', express.static(path.join(__dirname, '..', 'public'), {
	}));

    // Setup Sessions and Passport OAuth
    app.use(passport.initialize());
    app.use(passport.session());
    
    // API Access link for creating client ID and secret:
    // https://code.google.com/apis/console/
    var GOOGLE_CLIENT_ID = '379697648331-f7b2qooh3g6d787l0c1n6s66jh6us2u1.apps.googleusercontent.com';
    var GOOGLE_CLIENT_SECRET = 'lpWtlt_UwX-Ba0D25yqeN6OA';

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


    //var myself = null;
    
    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/signin-google"
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

	// artifical delay and errors
	// app.use(function(req, res, next) {
	// 	if(Math.random() < 0.05) {
	// 		// Randomly fail to test error handling
	// 		res.statusCode = 500;
	// 		res.end('Random fail! (you may remove this code in your app)');
	// 		return;
	// 	}
	// 	setTimeout(next, Math.ceil(Math.random() * 1000));
	// });

    app.get('/account', ensureAuthenticated, function (req, res) {
        res.render('account', { title: 'Test', user: req.user.displayName });
    });

    app.get('/login', function (req, res) {
        res.render('login', { title: 'Test', user: req.user.displayName });
    });

    // GET /auth/google
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  The first step in Google authentication will involve
    //   redirecting the user to google.com.  After authorization, Google
    //   will redirect the user back to this application at /auth/google/callback
    app.get('/auth/google',
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
    app.get('/signin-google', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        // Here user exists
        // res.set('token', req.user.token);
        res.redirect('/');
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    var Operator = require('./operator.js');
    var config = require('../operator.config.js');
    var operator = new Operator(config, app, ensureAuthenticated, renderer, stats);
    
    // TODO: iterate over config.plugins
    // require('../api/gnodes-api')(operator);
    // require('../api/research-api')(operator);
    // require('../api/utils-api')(operator);
	// require('../api/cmd-api')(operator);
    
    // Dynamically require a gooey component
    // This syntax is weird but it works
    config.plugins.forEach(function (req) {
        // require.ensure([], function () {
            // when this function is called
            // the module is guaranteed to be synchronously available.
        require(req)(operator);
        // });    
    });
    
    // load doozy REST api
	// require('doozy/src/Client/plugins/operator')(operator);

	// MAP FALLBACK ROUTES
	app.get('/*', ensureAuthenticated, function (req, res) {
		renderer.render(
			req.path,
			null,
			function(err, html) {
				if(err) {
					res.statusCode = 500;
					res.contentType = 'text; charset=utf8';
					res.end(err.message);
					return;
				}
				res.contentType = 'text/html; charset=utf8';
				res.end(html);
			}
		);
	});

    // start listening on port
	var port = process.env.PORT || options.defaultPort || 8080;
	app.listen(port, function () {
		console.log('Server listening on port ' + port);
	});
    
    // Simple route middleware to ensure user is authenticated.
    //   Use this route middleware on any resource that needs to be protected.  If
    //   the request is authenticated (typically via a persistent login session),
    //   the request will proceed.  Otherwise, the user will be redirected to the
    //   login page.
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { 
            return next(); 
        }
        res.redirect('/auth/google');
    }
};
