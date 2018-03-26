#!/bin/bash

# run all workers based on countries.list

TilesURL="https://s3.amazonaws.com/mapbox/osm-qa-tiles-production/latest.country"
WORKDIR="data"

while read -r line
do
    country="$line"
    echo "processing $country"
    
    # wget "$TilesURL/$country.mbtiles.gz"
    gunzip "$country.mbtiles.gz"

    ./workers/temporal.sh $country $WORKDIR
done < "countries.list"

