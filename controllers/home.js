var dotenv = require('dotenv');
dotenv.load();


/**
 * GET /
 */
exports.index = function(req, res) {
    console.log(req.ip);
    res.render('home', {
        key: process.env.API_KEY,
        title: 'Home'
    });
};
