'use strict';

module.exports = function(data, tile, writeData, done) {
    var units = 0;
    var sumIndex = 0;
    var population = 0;
    var actualOSM = 0;
    var predictionOSM = 0;
    data.completeness.completeness.features.forEach(function (feature) {
        if (feature.properties.index) {
            units = units + 1;
            sumIndex = sumIndex + feature.properties.index;
            var actual = JSON.parse(feature.properties.actual);
            var prediction = JSON.parse(feature.properties.prediction);

            population = population + actual['pop_sum'];
            actualOSM = actualOSM + actual['osm_avg'];
            predictionOSM = predictionOSM + prediction['osm_avg'];
        }
    })
    
    done(null, {'units': units, 'sumIndex': sumIndex, 'population': population, 'actualOSM': actualOSM, 'predictionOSM': predictionOSM});
};