var dotenv = require('dotenv');
dotenv.load();
const knex = require('../config/bookshelf.js').knex;

/**
 * POST /tree/infected
 * This endpoint saves a new, infected tree to the database.
 * TODO: Allow pictures + better location to be uploaded.
 */
exports.infectedTree = function(req, res) {
    var tree = {
        poster_id: req.session.user ? req.session.user.id : -1,
        saver_id: null,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.latitude),
        description: req.body.description,
        is_healthy: false
    };
    /* Need to convert lat and lon to whatever data-type necessary. 
     * Need to figure out how to save picture
     *
     */
    knex.insert(tree).into('trees').then(function() {
        knex('trees').where(tree).then(function(trees) {
            if (trees.length > 1) {
                return res.send('Duplicate tree!');
            } else if (trees.length == 0) {
                return res.send('Tree did not save properly.')
            }
            req.files.forEach(function(f) {
                if (f.mimetype.includes('image')) {
                    knex.insert({
                        filename: f.filename,
                        tree_id: trees[0].id,
                        is_before: true
                    }).into('pictures').then(function() {
                        console.log('doing stuff');
                    });
                }
            })
        })
    });


};

/**
 * POST /tree/saved
 * This endpoint changes an infected tree to a saved one.
 * TODO: 
 * Allow pictures to be uploaded.
 */
exports.savedTree = function(req, res) {
    knex('trees').where({
        id: req.body.treeId,
        isHealthy: false
    }).then(function(trees) {
        if (trees.length == 0) {
            return res.send('No tree with that ID that needs to be saved.');
        } else {
            knex('trees').where({
                id: req.body.treeId,
                isHealthy: false
            }).update({
                isHealthy: true,
                saverId: req.session.user ? req.session.user.id : -1
            }).then(function() {

                return res.send('Tree has been marked as safe.');
            });
        }
    });
}
