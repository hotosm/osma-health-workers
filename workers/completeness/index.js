#!/usr/bin/env node

const fs = require('fs');
var tileReduce = require('@mapbox/tile-reduce');
var path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const turfBbox = require('@turf/bbox').default;
var units = 0;
var averageCompleteness = 0;
const country = argv._[0];
const workdir = argv._[1];
const mbtilesPath = workdir + '/' + country + '/' + 'completeness.mbtiles';

// read country boundaries
const countries = JSON.parse(fs.readFileSync('countries.json'), {'encoding': 'utf-8'});
const boundaries = countries[country];

boundaries.features.forEach((b) => {
    const bbox = turfBbox(b);
    const name = b.properties.name.toLowerCase();

    getAverage(bbox, mbtilesPath, (err, averageCompleteness) => {
        console.log('name:', averageCompleteness);
        const boundaryLocation = workdir + '/' + country + '/' + name;
        let buildingStats = JSON.parse(fs.readFileSync(boundaryLocation + '/building-stats.json', { 'encoding': 'utf-8' }));
        buildingStats['averageCompleteness'] = averageCompleteness;
        fs.writeFileSync(boundaryLocation + '/building-stats.json', JSON.stringify(buildingStats), {'encoding': 'utf-8'});
    });

});

function getAverage(bbox, mbtilesPath, callback) {
    tileReduce({
        bbox: bbox,
        zoom: 12,
        map: path.join(__dirname, '/map.js'),
        sources: [
            {
                name: 'completeness',
                mbtiles: mbtilesPath,
                raw: false
            }
        ]
    })
    .on('reduce', function(data) {
        if (data.sumIndex) {
            units = units + data.units;
            averageCompleteness = averageCompleteness + data.sumIndex;
        }
    })
    .on('end', function() {
        averageCompleteness = averageCompleteness/units;
        callback(null, averageCompleteness);
    });
}