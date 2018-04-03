#!/bin/bash

TilesURL="https://s3.amazonaws.com/mapbox/osm-qa-tiles-production/latest.country"
Countries="https://gist.githubusercontent.com/geohacker/a0f2c9d7ad2a7f90dff0a360e3444ef6/raw/3ae79d2144ba2e8ba890f3a17e5bc5b76d2dd69c/countries.json"
WORKDIR="data"
COUNTRY=$1


wget "$TilesURL/$COUNTRY.mbtiles.gz"
wget "$Countries"
gunzip "$COUNTRY.mbtiles.gz"

./workers/temporal.sh $COUNTRY $WORKDIR
node ./workers/attribute-completeness.js $COUNTRY $WORKDIR