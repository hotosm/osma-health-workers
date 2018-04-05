#!/bin/bash

TilesURL="https://s3.amazonaws.com/mapbox/osm-qa-tiles-production/latest.country"
WORKDIR="data"
COUNTRY=$1


wget "$TilesURL/$COUNTRY.mbtiles.gz"
gunzip "$COUNTRY.mbtiles.gz"

# extract all the residential buildings
./workers/temporal.sh $COUNTRY $WORKDIR

# run attribute completeness validator and get stats
node ./workers/attribute-completeness.js $COUNTRY $WORKDIR

# filter all residential buildings and get edit receny stats
node ./workers/edit-recency.js $COUNTRY $WORKDIR