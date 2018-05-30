#!/usr/bin/env node

// Run using node workers/attribute-completeness.js country workdir
// example: node workers/attribute-completeness.js botswana workdir

const fs = require('fs');
const path = require('path');
const osmlint = require('../node_modules/osmlint');
const turfBbox = require('../node_modules/@turf/bbox').default;
const argv = require('../node_modules/minimist')(process.argv.slice(2));
const d3 = require('d3-queue');
const country = argv._[0];
const workdir = argv._[1];
const mbtilesPath = 'latest.planet.mbtiles';

// read country boundaries
const countries = JSON.parse(fs.readFileSync('countries.json'), {'encoding': 'utf-8'});
const boundaries = countries[country].boundaries;
const countryBBox = countries[country].bbox;

// run osmlint for the entire country
osmlint.incompleteResidentialBuildings({zoom: 12, bbox: countryBBox}, mbtilesPath, (err, data) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    const countryLocation = workdir + '/' + country;
    if (!fs.existsSync(countryLocation)) {
        fs.mkdirSync(countryLocation);
    }
    fs.writeFileSync(countryLocation + '/building-stats.json', JSON.stringify(data), {'encoding': 'utf-8'});
});

runOsmlint = (aoi, bbox, mbtilesPath, callback) => {
    osmlint.incompleteResidentialBuildings({zoom: 12, bbox: bbox}, mbtilesPath, function (err, data) {
        if (err) {
            callback(err, aoi);
        }
        const boundaryLocation = workdir + '/' + country + '/' + aoi;
        if (!fs.existsSync(boundaryLocation)) {
            fs.mkdirSync(boundaryLocation);
        }
        fs.writeFileSync(boundaryLocation + '/building-stats.json', JSON.stringify(data), {'encoding': 'utf-8'});
        callback(err, aoi);
    })
};

const queue = d3.queue(10);
boundaries.features.forEach((b) => {
    const bbox = turfBbox(b);
    const aoi = b.properties.id.toLowerCase();
    // run osmlint for each of the boundary and store stats in the workdir
    queue.defer(runOsmlint, aoi, bbox, mbtilesPath);
});

queue.awaitAll(function(err, data) {
    if (err) {
        console.error('Error', err);
        return;
    }
    console.error('done!');
});
