var dotenv = require('dotenv');
dotenv.load();
const knex = require('../config/bookshelf.js').knex;

/**
 * POST /tree/infected
 * This endpoint saves a new, infected tree to the database.
 */
exports.infectedTree = function(req, res) {
    /* 
     * We need:
     * latitude
     * longitude
     * pictures
     * descriptions
     * userId 
     *
     */
    var tree = {
        posterId: req.session.user ? req.session.user.id : -1,
        saverId: null,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.latitude),
        description: req.body.description,
        isHealthy: false
    };
    /* Need to convert lat and lon to whatever data-type necessary. 
     * Need to figure out how to save picture
     *
     */
    knex.insert(tree).into('trees')
        .then(function() {
            res.render('home', {
                key: process.env.API_KEY,
                title: 'Home',
                message: 'Tree inserted to map.'
            });
        });
};

/**
 * POST /tree/saved
 * This endpoint changes an infected tree to a saved one.
 */
exports.savedTree = function(req, res) {
    knex('trees').where({
        id: req.body.treeId,
        isHealthy: false
    }).update({
        isHealthy: true,
        saverId: req.session.user ? req.session.user.id : -1
    }).then(function() {
        res.render('home', {
            key: process.env.API_KEY,
            title: 'Home',
            message: 'Tree saved!'
        });
    });
}
