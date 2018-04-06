# osma-health-workers
Analysis workers for OSM Analytics Health Module. Read more [about the project here](https://github.com/hotosm/osma-health).

## Setup

1. `npm install`
2. Install [tippecanoe](https://github.com/mapbox/tippecanoe#installation)

## AOI
The AOIs are stored in the `countries.json` file, in the following schema:

```json
{
  "botswana":{
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {
            "type": "village",
            "name": "MOTOPI"
          },
          "geometry": {...}
        }
        ...
    ]
  }
}
```

## Workers
### Attribute Completeness
The attribute completeness worker uses [incompleteResidentialBuildings OSMLint](https://github.com/hotosm/osmlint/tree/master/validators/incompleteResidentialBuildings) validator, for each of the AOI and write results to the work directory in the following schema `building-stats.json`:

```json
{
  "buildingYes": 51141,
  "buildingResidential": 158,
  "buildingResidentialIncomplete": 158,
  "totalBuildings": 54778
}
```
### Duplicate Buildings
Uses [duplicateBuildings OSMLint](https://github.com/hotosm/osmlint/tree/master/validators/duplicateBuildings) validator to calculate total number of duplicate buildings in each AOI and add the result to the `building-stats.json`:
```
  "duplicateCount": 6.5
```
### Edit Recency / Temporal
Edit Recency worker runs [filterResidentialBuildings OSMLint](https://github.com/hotosm/osmlint/tree/master/validators/filterResidentialBuildings) validator and prepares an aggregated JSON `time-bins.json` with the following schema:

```json
{
	"201409": 11,
	"201410": 8,
	"201504": 1,
	"201609": 3,
	"201701": 1
}
```
## Run

Each work writes JSON to the country work directory. For example when you run `./run botswana`, the results will be written to `data/botswana/`.
