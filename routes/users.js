const express = require('express') ;

const router = express.Router() ;

const bcrypt = require('bcrypt') ;

const Users = require('../models/users');

const mongoose  = require('mongoose') ;

const jwb = require('jsonwebtoken')

// @desc Handles user sign up
// @route '/signup
router.post('/signup', (req, res, next) => {
    Users.find({email: req.body.email})
    .exec()
    .then(user => {
        if(user.length >= 1) {
            return res.status(401).json({
                err: 'Not authorized'
            })
        }
        // hash the password (gotten the request body)
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if(err) {
                res.status(500).json({
                    err: err
                })
            }
    
            else {
                const user = new Users({
                    _id:  new mongoose.Types.ObjectId(),
                    email: req.body.email,
                    password: hash
                })
                .save()
                .then(result => {
                    console.log(result)
                    res.status(201).json({
                        message: 'user created'
                    })
                })
                .catch(err => {
                    console.log(err)
                    res.status(505).json({
                        err: err 
                    })
                })
            }
        })
    })
})

// @desc Handles user login
// @route '/login
// @err 401 meaning unauthorized.

router.post('/login', (req, res, next) => {
    Users.find({email: req.body.email})
    .exec()
    .then(user => {
        if (user.length < 1) {
            return res.status(401).json({
                err: 'Auth failed!'
            })
        }
        // checks for the request body password and the harshed password gotten from the user object.
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if(err) {
                return res.status(401).json({
                    err: 'Auth failed!'
                })
            }

            // We get our javascript web token here
            if(result) {
                const token = jwb.sign({
                    email: user[0].email,
                    _id: user[0]._id 
                }, 
                process.env.JWT_KEY,
                {
                    expiresIn: "1h"
                })
                return res.status(201).json({
                    message: "Auth successful",
                    token: token
                })
            }

            res.status(401).json({
                err: 'Auth failed!'
            })
        })        
    })
    .catch(err => {
        console.log(err)
        res.status(505).json({
            err: err 
        })
    })
})

router.delete('/:id', (req, res, next) => {
    Users.remove({_id: req.params.id})
    .select('email password _id')
    .exec()
    .then(user => {
        res.status(200).json({
            message: 'User deleted'
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            err: err
        })
    })
})

module.exports = router