const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');

const Schema = mongoose.Schema;

const citySchema = new Schema({
    cityID: {
        type: Number,
        required: true
    },
    cityname: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('City', citySchema, 'city');