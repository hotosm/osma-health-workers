#!/usr/bin/env node

// Get stats for untagged ways
// Run using node workers/untagged-ways.js country workdir
// example: node workers/untagged-ways.js botswana workdir


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
    const name = b.properties.id.toLowerCase();

     // run osmlint for each of the boundary and store stats in the workdir
     osmlint.untaggedWays({zoom: 12, bbox: bbox}, mbtilesPath, (err, data) => {
        if (err) {
            console.error('Error:', err);
            return;
        }
        const boundaryLocation = workdir + '/' + country + '/' + name;
        let buildingStats = JSON.parse(fs.readFileSync(boundaryLocation + '/building-stats.json', { 'encoding': 'utf-8' }));
        buildingStats['untaggedWays'] = data;
        fs.writeFileSync(boundaryLocation + '/building-stats.json', JSON.stringify(buildingStats), {'encoding': 'utf-8'});
    });
});