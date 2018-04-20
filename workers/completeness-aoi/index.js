#!/usr/bin/env node

const fs = require('fs');
var tileReduce = require('@mapbox/tile-reduce');
var path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const turfBbox = require('@turf/bbox').default;
var units = 0;
const country = argv._[0];
const workdir = argv._[1];
const mbtilesPath = workdir + '/' + country + '/' + 'completeness.mbtiles';

// read country boundaries
const countries = JSON.parse(fs.readFileSync('countries.json'), {'encoding': 'utf-8'});
const boundaries = countries[country];

boundaries.features.forEach((b) => {
    const bbox = turfBbox(b);
    const aoi = b.properties.id.toLowerCase();

    getAverage(bbox, mbtilesPath, (err, data) => {
        const boundaryLocation = workdir + '/' + country + '/' + aoi;
        let buildingStats = JSON.parse(fs.readFileSync(boundaryLocation + '/building-stats.json', { 'encoding': 'utf-8' }));
        buildingStats['averageCompleteness'] = data.completeness;
        buildingStats['population'] = data.population;
        fs.writeFileSync(boundaryLocation + '/building-stats.json', JSON.stringify(buildingStats), {'encoding': 'utf-8'});
    });

});

function getAverage(bbox, mbtilesPath, callback) {
    var averageCompleteness = 0;
    var population = 0;
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
            population = population + data.population;
        }
    })
    .on('end', function() {
        if (units) {
            averageCompleteness = averageCompleteness/units;
        }
        callback(null, { 'completeness': averageCompleteness, 'population': population });
    });
}