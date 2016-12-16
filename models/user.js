// User Model
'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({
    name:                           String,
    email:                           String,
    hashed_password:         String,
    temp_password:            String,
    temp_pass_time:           String
});

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/node-login');

module.exports = mongoose.model('user', userSchema);