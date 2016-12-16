'use strict';

const user = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const config = require('../config/config.json');

exports.changePassword = (email, password, newPassword) =>
        new Promise((resolve, reject) => {
            user.find({email: email})
                .then(users => {
                    let user = users[0];
                    const hashed_password = user.hashed_password;
                    if(bcrypt.compareSync(password, hashed_password)) {
                        const salt = bcrypt.genSaltSync(10);
                        const hash = bcrypt.hashSync(newPassword, salt);

                        user.hashed_password = hash;
                        return user.save();
                    } else {
                        reject({
                            status: 401,
                            message: 'Invalid Old Password'
                        });
                    }
                }).then(user => resolve({
                    status: 200,
                    message: 'Password Updated Successfully'
                })).catch(err => reject({
                    status: 500,
                    message: 'Internal Server Error'
                }));
        });

exports.resetPasswordInit = email =>
        new Promise((resolve, reject) => {
            const random = randomstring.generate(8);
            user.find({email: email})
                .then(users => {
                    if(users.length == 0) {
                        reject({
                            status: 404, message: 'User not found'
                        });
                    } else {
                        let user = users[0];
                        const salt = bcrypt.genSaltSync(10);
                        const hash = bcrypt.hashSync(random, salt);

                        user.temp_password = hash;
                        user.temp_pass_time = new Date();

                        return user.save();
                    }
                }).then (user => {
                    const transporter = nodemailer.createTransport(`smtps://${config.email}:${config.password}@smtp.gmail.com`);
                    const mailOptions = {
                        from: `"${config.name}" <${config.email}>`,
                        to: email,
                        subject: 'Reset Password Request',
                        html: `Hello ${user.name},
                                    Your reset password token is <b>${random}</b>.
                        If you are viewing this email from an Android device, click this <a href="http://192.168.138.186/${random}">link</a>/
                        The token is valid only for 2 minutes.

                        Thank You
                        Node-Login`
                    };

                    return transporter.sendMail(mailOptions);
                }).then (info => {
                    console.log(info);
                    resolve({
                        status: 200, message: 'Check your registered email for instructions'
                    });
                }).catch(err => {
                    console.log(err);
                    reject({
                        status: 500, message: 'Internal Server Error'
                    });
                });
        });

exports.resetPasswordFinish = (email, token, password) =>
        new Promise((resolve, reject) => {
            user.find({email: email})
                .then(users => {
                    let user = users[0];

                    const diff = new Date() - new Date(user.temp_pass_time);
                    const seconds = Math.floor(diff/1000);
                    console.log(`Seconds: ${seconds}`);

                    if(seconds < 120) {
                        return user;
                    }else {
                        reject({
                            status: 401,
                            message: 'Time out! Try Again'
                        });
                    }
                }).then(user => {
                    if(bcrypt.compareSync(token, user.temp_password)) {
                        const salt = bcrypt.genSaltSync(10);
                        const hash = bcrypt.hashSync(password, salt);
                        user.hashed_password = hash;
                        user.temp_password = undefined;
                        user.temp_pass_time = undefined;

                        return user.save();
                    } else {
                        reject({
                            status: 401,
                            message: 'Invalid token'
                        });
                    }
                }).then(user => resolve({
                    status: 200,
                    message: 'Password Changed Successfuly'
                })).catch(err => reject({
                    status: 500,
                    message: 'Internal Server Error'
                }));
        });
