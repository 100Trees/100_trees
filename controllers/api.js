var dotenv = require('dotenv');
dotenv.load();
const knex = require('../config/bookshelf.js').knex;
const postgis = require('knex-postgis')(knex);
const _ = require('lodash');
/**
 * POST /tree/infected
 * This endpoint saves a new, infected tree to the database.
 */
async function infectedTree(req, res) {
    console.log(req.files);
    if (req.files.length == 0) return res.send('No valid image files given');
    const tree = {
        geom: knex.raw('ST_SetSRID(' + postgis.makePoint(parseFloat(req.body.longitude), parseFloat(req.body.latitude)) + ',4326)'),
        posterId: req.session.user ? req.session.user.id : -1,
        saverId: null,
        isHealthy: false,
        description: req.body.description
    };

    const id = await knex.insert(tree).returning('id').into('trees');

    _.each(req.files, async(f) => {
        await knex.insert({
            filename: f.filename,
            tree_id: id[0],
            is_before: true
        }).into('pictures');
    });

    // getTrees(req, res);

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
    // if (isInvalidUpload(req.files)) {
    //     return res.send('Included non image file');
    // }
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

/**
 * This endpoint returns all trees within a specified radius in miles. Default is 10 miles.
 * There is also an option to only return a certain number of trees.
 */

async function getTrees(req, res) {
    /*
     * long, lat REQ
     * healthy, range, num optional
     */

    const range = req.body.range ? parseFloat(req.body.range) * 1609.34 : 16093.4;
    // if (range > UPPER LIMIT ON RANGE) return res.send('Upper limit on range hit.');
    const isHealthy = req.body.isHealthy ? parseBoolean(req.body.isHealthy.toLowerCase()) : null;

    const number = req.body.number ? req.body.number : 15;
    // if (number > UPPER LIMIT ON NUM) return res.send('Upper limit on range hit.');
    if (!req.body.longitude || !req.body.latitude) return res.send('Invalid latitude or longitude');
    const longitude = parseFloat(req.body.longitude);
    const latitude = parseFloat(req.body.latitude);
    const trees = [];
    const returned = isHealthy != null ? await knex.select('*', knex.raw('ST_X(geom) AS longitude'), knex.raw('ST_Y(geom) AS latitude')).from('trees').where({ isHealthy: isHealthy }).andWhere(knex.raw('ST_Distance_Sphere(geom, ST_SetSRID(' + postgis.makePoint(longitude, latitude) + ',4326)) <= ' + range + ';'))
        : await knex.select('*', knex.raw('ST_X(geom) AS longitude'), knex.raw('ST_Y(geom) AS latitude')).from('trees').where(knex.raw('ST_Distance_Sphere(geom, ST_SetSRID(' + postgis.makePoint(longitude, latitude) + ',4326)) <= ' + range + ';'));
    _.each(returned, (row) => {
        if (trees.length < number) {
            trees.push(row);
        }
    });
    res.send(trees);
}

async function treeInfo(req, res) {
    const tree_id = req.body.id;
    if (!tree_id) res.send('No tree id provided.');
    const trees = await knex('trees').where({ id: tree_id });
    if (trees.length !== 1) res.send('Tree id has either 0 or more than 1 trees associated with it.');
    const tree = trees[0];
    const userId = tree.posterId;
    const is_before = !(tree.isHealthy);
    const pictures = await knex('pictures').where({ tree_id, is_before });
    const users = await knex('users').where({ id: userId });
    const username = userId === -1 && users.length === 0 ? "Guest User" : users[0].name;
    res.send(
    {
        username,
        pictures,
        tree
    });
}

function me(req, res) {
    res.send(req.user ? req.user : {});
}

function imageFilter(req, file, cb) {
    if(file.mimetype.includes('image')) cb(null, true);
    else cb(null, false);
}

module.exports = { infectedTree, savedTree, getTrees, imageFilter, me, treeInfo };