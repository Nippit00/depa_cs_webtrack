const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');

const Schema = mongoose.Schema;

const userSchema = new Schema({
   
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        required: true
    },

    nameFirst: {
        type: String,
        required: true
    },
    nameLast: {
        type: String,
        required: true
    },
    nameNick: {
        type: String
    },
    nameFirstTH: {
        type: String,
        required: true
    },
    nameLastTH: {
        type: String,
        required: true
    },
    nameNickTH: {
        type: String
    },

    position: {
        type: String
    },
    positionTH: {
        type: String
    },

    imgURL:{
        type: String
    },

    resetToken:{
        type: String
    },
    resetTokenExpiration:{
        type: Date
    },

    requiredUpdatePassword:{
        type: Boolean
    },

});

module.exports = mongoose.model('User', userSchema);