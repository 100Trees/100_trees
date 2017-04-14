var dotenv = require('dotenv');
dotenv.load();
const knex = require('../config/bookshelf.js').knex;

/**
 * POST /tree/infected
 * This endpoint saves a new, infected tree to the database.
 * TODO: Allow pictures + better location to be uploaded.
 */
async function infectedTree(req, res) {
    var tree = {
        poster_id: req.session.user ? req.session.user.id : -1,
        saver_id: null,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.latitude),
        description: req.body.description,
        is_healthy: false
    };
    var id = await knex.insert(tree).returning('id').into('trees');
    req.files.forEach(function(f) {
        if (f.mimetype.includes('image')) {
            await knex.insert({
                filename: f.filename,
                tree_id: id,
                is_before: true
            }).into('pictures');
        } else {
            console.log('Trying to insert non-images.');
        }
    })
    res.send('Done inserting!');
};

/**
 * POST /tree/saved
 * This endpoint changes an infected tree to a saved one.
 * TODO: 
 * Allow pictures to be uploaded.
 */
async function savedTree(req, res) {
    var trees = await knex('trees').where({
        id: req.body.treeId,
        is_healthy: false
    })
    if (trees.length == 0) {
        return res.send('No tree with that ID that needs to be saved.');
    }
    await knex('trees').where({
        id: req.body.treeId,
        is_healthy: false
    }).update({
        is_healthy: true,
        saver_id: req.session.user ? req.session.user.id : -1
    })
    req.files.forEach(function(f) {
        if (f.mimetype.includes('image')) {
            await knex.insert({
                filename: f.filename,
                tree_id: req.body.treeId,
                is_before: false
            }).into('pictures');
        } else {
            console.log('Trying to insert non-images.');
        }
    })
    return res.send('Tree has been marked as safe.');
}

module.exports = { infectedTree, savedTree };
