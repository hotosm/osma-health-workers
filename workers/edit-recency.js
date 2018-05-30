#!/usr/bin/env node

// Script to produce building counts binned by year
// Run using node workers/time-buckets.js path/to/temporal.json

const fs = require('fs');
const osmlint = require('../node_modules/osmlint');
const turfBbox = require('../node_modules/@turf/bbox').default;
const argv = require('../node_modules/minimist')(process.argv.slice(2));
const d3 = require('d3-queue');
const country = argv._[0];
const workdir = argv._[1];
const mbtilesPath = country + '.mbtiles';

// read country boundaries
const countries = JSON.parse(fs.readFileSync('countries.json'), {'encoding': 'utf-8'});
const boundaries = countries[country];

runOsmlint = (aoi, bbox, mbtilesPath, callback) => {
    osmlint.filterBuildings({zoom: 12, bbox: bbox}, mbtilesPath, function (err, data) {
        if (err) {
            callback(err, aoi);
        }
        const boundaryLocation = workdir + '/' + country + '/' + aoi;
        if (!fs.existsSync(boundaryLocation)) {
            fs.mkdirSync(boundaryLocation);
        }
        fs.writeFileSync(boundaryLocation + '/time-bins.json', JSON.stringify(data), {'encoding': 'utf-8'});
        callback(err, aoi);
    })
};

const queue = d3.queue(5);
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