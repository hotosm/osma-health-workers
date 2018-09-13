#!/usr/bin/env node

// Run using node workers/aggregate.js country workdir
// example: node workers/aggregate.js botswana workdir

const fs = require('fs');
const path = require('path');
const osmlint = require('../node_modules/osmlint');
const turfBbox = require('../node_modules/@turf/bbox').default;
const argv = require('../node_modules/minimist')(process.argv.slice(2));
const country = argv._[0];
const workdir = argv._[1];

// read country boundaries
const countries = JSON.parse(fs.readFileSync('countries.json'), {'encoding': 'utf-8'});
const boundaries = countries[country];

boundaries.features.forEach((b) => {
    const bbox = turfBbox(b);
    const aoi = b.properties.id.toLowerCase();

  let stats = {};
  const boundaryLocation = workdir + '/' + country + '/' + aoi;
  const buildingStats = JSON.parse(fs.readFileSync(boundaryLocation + '/building-stats.json', { 'encoding': 'utf-8' }));
  const timeBins = JSON.parse(fs.readFileSync(boundaryLocation + '/time-bins.json'), {'encoding': 'utf-8'});
  stats['building-stats'] = buildingStats;
  stats['time-bins'] = timeBins;
  stats['timestamp'] = new Date().toISOString();

  fs.writeFileSync(boundaryLocation + '/stats.json', JSON.stringify(stats), { 'encoding': 'utf-8' });
});
