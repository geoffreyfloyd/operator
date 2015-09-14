module.exports = [
	require("./make-webpack-config-new")({
		// commonsChunk: true,
		target: 'node',
		//longTermCaching: true,
		separateStylesheet: true,
		//minimize: true
		// devtool: "source-map"
	})
];
