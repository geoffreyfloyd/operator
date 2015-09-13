
// This file describe which stores exists and in which format updates are stored and merged

module.exports = {
	// the Router is a local store that handles information about data fetching
	// see ../config/app.jsx
	Router: {
		local: true,
		readSingleItem: function(item, callback) {
			callback(null, item.oldData || null);
		}
	}
};
