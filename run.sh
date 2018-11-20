#!/bin/bash

TilesURL="https://s3.amazonaws.com/mapbox/osm-qa-tiles-production/latest.country"
WORKDIR="data"
COUNTRY=$1
MIN_ZOOM_LEVEL=$2
MAX_ZOOM_LEVEL=$3
S3BUCKET=$4
MAPBOXACCOUNT=$5
MAPBOXTOKEN=$6 # probably move to envvar when needed

wget "$TilesURL/$COUNTRY.mbtiles.gz"
gunzip "$COUNTRY.mbtiles.gz"

# extract all the residential buildings
echo '1. Extract buildings...'
./workers/temporal.sh $COUNTRY $WORKDIR

# create a tileset of all buildings
echo '2. Creating tileset of all buildings...'
tippecanoe -f -z $MAX_ZOOM_LEVEL -Z $MIN_ZOOM_LEVEL -l osm $WORKDIR/$COUNTRY/buildings.json -o $WORKDIR/$COUNTRY/buildings.mbtiles

# run attribute completeness validator and get stats
echo '3. Run attribute completeness validator...'
node ./workers/attribute-completeness.js $COUNTRY $WORKDIR

# filter all residential buildings and get edit receny stats
echo '4. Get edit recency stats...'
node ./workers/edit-recency.js $COUNTRY $WORKDIR

# download map completeness json
echo '5. Download compeleteness predictions...'
wget http://s3.amazonaws.com/hotosm-population/predict/$COUNTRY.json -O $WORKDIR/$COUNTRY/$COUNTRY-predictions.json

# create tileset for map completeness
echo '6. Create map completeness tileset...'
node ./workers/map-completeness-tiles.js $WORKDIR/$COUNTRY/$COUNTRY-predictions.json | tippecanoe -l completeness -f -o $WORKDIR/$COUNTRY/completeness.mbtiles

# get the domain of predicted indices
node ./workers/completeness-domain.js $WORKDIR/$COUNTRY/$COUNTRY-predictions.json > $WORKDIR/$COUNTRY/domain.json

# prepare completeness per aoi
echo '7. Prepare completeness per AoI...'
node ./workers/completeness-aoi/index.js $COUNTRY $WORKDIR

# run stats for duplicate buildings
echo '8. Get duplicate buildings stats...'
node ./workers/duplicate-buildings.js $COUNTRY $WORKDIR > /dev/null

# run stats for untagged ways
echo '9. Get untagged ways stats'
node ./workers/untagged-ways.js $COUNTRY $WORKDIR > /dev/null

# aggregate
echo '10. Aggregate...'
node ./workers/aggregate.js $COUNTRY $WORKDIR > /dev/null

# copy the results to S3
echo '11. Upload results...'
aws s3 sync $WORKDIR/$COUNTRY s3://$S3BUCKET/$WORKDIR/$COUNTRY

# upload completeness tileset to Mapbox
mapbox --access-token $MAPBOXTOKEN upload $MAPBOXACCOUNT.$COUNTRY-completeness $WORKDIR/$COUNTRY/completeness.mbtiles

# upload building tileset to Mapbox
mapbox --access-token $MAPBOXTOKEN upload $MAPBOXACCOUNT.$COUNTRY-buildings $WORKDIR/$COUNTRY/buildings.mbtiles
