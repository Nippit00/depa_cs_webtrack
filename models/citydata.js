const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');

const Schema = mongoose.Schema;

const cityDataSchema = new Schema({
    cityID: {
        type: Number,
        required: true
    },
    province: {
        type: String,
        required: true
    },
    date:{
        type: String,
        required: true
    },

    username: {
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },

    LAT:{
        type: String,
        required: true
    },
    LNG:{
        type: String,
        required: true
    },
});

module.exports = mongoose.model('CityData', cityDataSchema, 'citydata');