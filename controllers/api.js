var dotenv = require('dotenv');
dotenv.load();
const knex = require('../config/bookshelf.js').knex;
const postgis = require('knex-postgis')(knex);
const _ = require('lodash');
/**
 * POST /tree/infected
 * This endpoint saves a new, infected tree to the database.
 * TODO: Allow pictures + better location to be uploaded.
 */
async function infectedTree(req, res) {
    const tree = {
        geom: knex.raw('ST_SetSRID(' + postgis.makePoint(parseFloat(req.body.longitude), parseFloat(req.body.latitude)) + ',4326)'),
        posterId: req.session.user ? req.session.user.id : -1,
        saverId: null,
        isHealthy: false,
        description: req.body.description
    };
    if (isInvalidUpload(req.files)) {
        return res.send('Included non image file');
    }
    const id = await knex.insert(tree).returning('id').into('trees');
    _.each(req.files, async(f) => {
        await knex.insert({
            filename: f.filename,
            tree_id: id,
            is_before: true
        }).into('pictures');
    });
    return res.redirect('/contact');
};

/**
 * POST /tree/saved
 * This endpoint changes an infected tree to a saved one.
 * TODO: 
 * Allow pictures to be uploaded.
 */
async function savedTree(req, res) {
    const id = req.body.treeId;
    const trees = await knex('trees').where({
        id: id,
        is_healthy: false
    });
    if (trees.length == 0) {
        return res.send('No tree with that ID that needs to be restored.');
    }
    if (isInvalidUpload(req.files)) {
        return res.send('Included non image file');
    }
    await knex('trees').where({
        id: req.body.treeId,
        is_healthy: false
    }).update({
        is_healthy: true,
        saver_id: req.session.user ? req.session.user.id : -1
    });
    _.each(req.files, async(f) => {
        await knex.insert({
            filename: f.filename,
            tree_id: id,
            is_before: false
        }).into('pictures');
    });
    return res.send(`Tree has been marked as safe with ${req.files.length} pictures.`);
}

function isInvalidUpload(files) {
    return _.findLast(files, (f) => {
        return !f.mimetype.includes('image');
    });
}

module.exports = { infectedTree, savedTree };
