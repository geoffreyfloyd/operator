module.exports = function(options) {

	var express = require('express');
    var socketServer = require('./socket-server');
    var cookieParser = require('cookie-parser');
	var bodyParser = require('body-parser');
    var session = require('express-session')
    var methodOverride = require('method-override')
	var path = require('path');
    var Operator = require('./operator.js');
    var config = require('../operator.config.js');
    var open = require('open');
    
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
        secret: config.sessionSecret
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
    
    // Setup account routes
    app.get('/account', ensureAuthenticated, function (req, res) {
        res.render('account', { title: 'Test', user: req.user.displayName });
    });

    app.get('/login', function (req, res) {
        res.render('login', { title: 'Test', user: req.user.displayName });
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    // Setup Operator
    var operator = new Operator(config, app, socketServer, ensureAuthenticated, renderer, stats);
    
    // TODO: iterate over config.plugins
    // require('../api/gnodes-api')(operator);
    // require('../api/research-api')(operator);
    // require('../api/utils-api')(operator);
	// require('../api/cmd-api')(operator);
    
    // Dynamically require and inject operator into plugins
    config.plugins.forEach(function (req) {
        require(req)(operator);
    });

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
        // Open the Application
        if (options.openApp) {
            open('http://localhost:8080');
        }
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
