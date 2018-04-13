#!/usr/bin/env node

// Script to produce building counts binned by year
// Run using node workers/time-buckets.js path/to/temporal.json

const fs = require('fs');
const osmlint = require('../node_modules/osmlint');
const turfBbox = require('../node_modules/@turf/bbox').default;
const argv = require('../node_modules/minimist')(process.argv.slice(2));
const country = argv._[0];
const workdir = argv._[1];
const mbtilesPath = country + '.mbtiles';

// read country boundaries
const countries = JSON.parse(fs.readFileSync('countries.json'), {'encoding': 'utf-8'});
const boundaries = countries[country];

boundaries.features.forEach((b) => {
    const bbox = turfBbox(b);
    const name = b.properties.name.toLowerCase();

    // run osmlint for each of the boundary and store stats in the workdir
    osmlint.filterBuildings({zoom: 12, bbox: bbox}, mbtilesPath, (err, data) => {
        if (err) {
            console.error('Error:', err);
            return;
        }
        const boundaryLocation = workdir + '/' + country + '/' + name;
        if (!fs.existsSync(boundaryLocation)) {
            fs.mkdirSync(boundaryLocation);
        }
        fs.writeFileSync(boundaryLocation + '/time-bins.json', JSON.stringify(data), {'encoding': 'utf-8'});
    });
});