#!/bin/bash

TilesURL="https://s3.amazonaws.com/mapbox/osm-qa-tiles-production/latest.country"
WORKDIR="data"
COUNTRY=$1


wget "$TilesURL/$COUNTRY.mbtiles.gz"
gunzip "$COUNTRY.mbtiles.gz"

./workers/temporal.sh $COUNTRY $WORKDIR
node ./workers/attribute-completeness.js $COUNTRY $WORKDIR