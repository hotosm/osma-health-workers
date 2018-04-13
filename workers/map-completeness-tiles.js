#!/usr/bin/env node

const fs = require('fs');
const argv = require('../node_modules/minimist')(process.argv.slice(2));
const tilebelt = require('../node_modules/@mapbox/tilebelt');
const turfHelpers = require('../node_modules/@turf/helpers');
const estimateFile = argv._[0];

const estimates = JSON.parse(fs.readFileSync(estimateFile, { 'encoding': 'utf-8' }));

const data = [];
Object.keys(estimates).forEach((key) => {
    let tile = key.split('/');
    tile = [parseInt(tile[1]), parseInt(tile[2]), parseInt(tile[0])];
    let geom = turfHelpers.feature(tilebelt.tileToGeoJSON(tile));
    geom.properties = estimates[key];
    data.push(geom);
    // console.log(JSON.stringify(geom));
});

console.log(JSON.stringify(turfHelpers.featureCollection(data)));