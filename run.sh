#!/bin/bash

TilesURL="https://s3.amazonaws.com/mapbox/osm-qa-tiles-production/latest.country"
WORKDIR="data"
COUNTRY=$1
S3BUCKET=$2
MAPBOXACCOUNT=$3
MAPBOXTOKEN=$4 # probably move to envvar when needed

wget "$TilesURL/$COUNTRY.mbtiles.gz"
gunzip "$COUNTRY.mbtiles.gz"

# extract all the residential buildings
./workers/temporal.sh $COUNTRY $WORKDIR

# create a tileset of all residential buildings
tippecanoe -f -z 15 -Z 12 -l osm $WORKDIR/$COUNTRY/buildings.json -o $WORKDIR/$COUNTRY/buildings.mbtiles

# run attribute completeness validator and get stats
node ./workers/attribute-completeness.js $COUNTRY $WORKDIR

# filter all residential buildings and get edit receny stats
node ./workers/edit-recency.js $COUNTRY $WORKDIR

# download map completeness json
wget http://s3.amazonaws.com/hot-osm/$COUNTRY-predictions.json -O $WORKDIR/$COUNTRY/$COUNTRY-predictions.json

# create tileset for map completeness
node ./workers/map-completeness-tiles.js $WORKDIR/$COUNTRY/$COUNTRY-predictions.json | tippecanoe -l completeness -f -o $WORKDIR/$COUNTRY/completeness.mbtiles

# get the domain of predicted indices
node ./workers/completeness-domain.js $WORKDIR/$COUNTRY/$COUNTRY-predictions.json > $WORKDIR/$COUNTRY/domain.json

# prepare completeness per aoi
node ./workers/completeness-aoi/index.js $COUNTRY $WORKDIR

# run stats for duplicate buildings
node ./workers/duplicate-buildings.js $COUNTRY $WORKDIR > /dev/null

# copy the results to S3
aws s3 sync $WORKDIR/$COUNTRY s3://$S3BUCKET/$WORKDIR/$COUNTRY

# upload completeness tileset to Mapbox
mapbox --access-token $MAPBOXTOKEN upload $MAPBOXACCOUNT.$COUNTRY-completeness $WORKDIR/$COUNTRY/completeness.mbtiles

# upload building tileset to Mapbox
mapbox --access-token $MAPBOXTOKEN upload $MAPBOXACCOUNT.$COUNTRY-buildings $WORKDIR/$COUNTRY/buildings.mbtiles
