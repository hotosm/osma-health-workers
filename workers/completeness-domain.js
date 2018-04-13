#!/usr/bin/env node

// For a predictions JSON file, get the domain of indices.

const _ = require('lodash');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));
const estimateFile = argv._[0];

const estimates = JSON.parse(fs.readFileSync(estimateFile, { 'encoding': 'utf-8' }));
console.log(_.map(estimates, 'index'));