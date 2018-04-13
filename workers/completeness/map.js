'use strict';

module.exports = function(data, tile, writeData, done) {
    var units = 0;
    var sumIndex = 0;
    data.completeness.completeness.features.forEach(function (feature) {
        if (feature.properties.index) {
            units = units + 1;
            sumIndex = sumIndex + feature.properties.index;
        }
    })
    
    done(null, {'units': units, 'sumIndex': sumIndex});
};