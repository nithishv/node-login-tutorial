// User Registration
'use strict'

const user = require('../models/user');
const bcrypt = require('bcryptjs');

exports.registerUser = (name, email, password) =>
        new Promise((resolve, reject) => {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);

            const newUser = new user({
                name: name,
                email: email,
                hashed_password: hash,
            });
            newUser.save().then(() => resolve ({
                status: 201, message: 'User registered successfully'
            })).catch(err => {
                if(err.code === 11000) {
                    reject({status: 409, message: 'User already registered'});
                } else {
                    reject({status: 500, message: 'Internal Server Error'});
                }
            });
        });
