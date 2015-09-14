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