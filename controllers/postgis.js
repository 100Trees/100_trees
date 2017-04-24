const knex = require('../config/bookshelf.js').knex;
const pg = require('knex-postgis')(knex);

async function setSRID(geom, number){
	knex.raw('ST_SetSRID(' + geom + ',' + number + ')');
}

async function distanceSphere(geom1, geom2){
	return knex.raw('ST_Distance_Sphere(' + geom1 + ',' + geom2 + ')');
}

async function makePoint(long, lat){
	return pg.makePoint(long, lat);
}

