'use strict';

const user  = require('../models/user');

exports.getProfile = email =>
        new Promise ((resolve, reject ) => {
            user.find({email: email}, {name: 1, email: 1, _id: 0})
                .then(users => resolve(user[0]))
                .catch(err => reject({
                    status: 500,
                    message: 'Internal Server Error'
                }));
        });
