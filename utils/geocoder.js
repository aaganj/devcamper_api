const NodeGeocoder = require('node-geocoder');

const options = {
    provider: 'mapquest',
    httpAdapter: 'https',
    apiKey: 'aNMbGTfPN1CXpIESWjPhP2bpwVuO3MMy',
    formatter: null
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;

