var dotenv = require('dotenv');
dotenv.load();


/**
 * GET /
 */
exports.index = function(req, res) {
    console.log(req.user);
   	const coords = req.user ? (req.user.attributes.latitude ? { latitude: req.user.attributes.latitude, longitude: req.user.attributes.longitude } : null) : null;
   	console.log(coords);
   	res.expose(coords, 'coordinates');
    res.render('home', {
        key: process.env.API_KEY,
        title: 'Home',
    });
};
