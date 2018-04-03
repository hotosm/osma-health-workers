#!/usr/bin/env node

// Run using node workers/attribute-completeness.js country workdir
// example: node workers/attribute-completeness.js botswana workdir

const fs = require('fs');
const path = require('path');
const osmlint = require('../node_modules/osmlint')
const argv = require('../node_modules/minimist')(process.argv.slice(2));
const country = argv._[0];
const workdir = argv._[1];
const mbtilesPath = country + '.mbtiles';

// run osmlint and store stats in the workdir
osmlint.incompleteResidentialBuildings({zoom: 12}, mbtilesPath, (err, data) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    fs.writeFileSync(workdir + '/' + country + '/building-stats.json', JSON.stringify(data), {'encoding': 'utf-8'});
});



