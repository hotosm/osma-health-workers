#!/usr/bin/env node

// Run using node workers/duplicate-buildings.js country workdir
// example: node workers/duplicate-buildings.js botswana workdir

const fs = require('fs');
const path = require('path');
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
    const aoi = b.properties.id.toLowerCase();

    // run osmlint for each of the boundary and store stats in the workdir
    osmlint.duplicateBuildings({zoom: 12, bbox: bbox}, mbtilesPath, (err, data) => {
        if (err) {
            console.error('Error:', err);
            return;
        }

        // write the duplicate count into building-stats.json
        const boundaryLocation = workdir + '/' + country + '/' + aoi;
        let buildingStats = JSON.parse(fs.readFileSync(boundaryLocation + '/building-stats.json', { 'encoding': 'utf-8' }));
        buildingStats['duplicateCount'] = data;

        fs.writeFileSync(boundaryLocation + '/building-stats.json', JSON.stringify(buildingStats), {'encoding': 'utf-8'});
    });
});