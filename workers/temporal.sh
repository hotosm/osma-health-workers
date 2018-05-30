#!/bin/bash

# ./temporal.sh country
# runs filterResidentialBuildings OSMLint validator and creates a FeatureCollection

COUNTRY=$1
WORKDIR=$2
echo "running temporal for $COUNTRY"
mkdir -p $WORKDIR/$COUNTRY/
BBOX=$(cat countries.json | jq ".$COUNTRY.bbox")
node node_modules/osmlint/cli.js filterbuildings --zoom=12 --bbox="$BBOX" "latest.planet.mbtiles" > $WORKDIR/$COUNTRY/buildings.json
