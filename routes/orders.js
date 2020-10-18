const express = require('express') ;

const router = express.Router() ;

// I need mongoose to get access to the ID
const mongoose = require('mongoose')

const Order = require('../models/orders')

const checkAuth = require('../middleware/check-auth') 

// To use the product
const Product = require('../models/products');

// @desc Handles order get request
// @route /

router.get('/', checkAuth, (req, res, next) => {
    Order.find()
    .select('_id productId quantity')
    .populate('productId', 'description location information price')
    .exec()
    .then(orders => {
        const response = {
            length: orders.length,
            orders: orders.map(order => (
                {
                    _id: order._id,
                    productId: order.productId,
                    quantity: order.quantity,
                    request: {
                        type: 'GET',
                        url: 'https://localhost:3000/orders/' + order._id
                    }
                }
            ))
        }

        res.status(200).json(response)
    })
    .catch(err => {
        res.status(500).json({
            err: err
        })
    })
}) ;

// @desc Handles order post request
// @route /add

router.post('/', checkAuth, (req, res, next) => {
    // Check if the ID I provided is available in my product model
    Product.findById(req.body.productId)
    .exec()
    .then(product => {
        if(!product) {
            return res.status(404).json({
                message: 'Product not found'
            })
        }
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            productId: req.body.productId,
            quantity: req.body.quantity
        })
        return order.save()
    })
    .then(order => {
        res.status(201).json({
            message: 'Order posted!',
            createdOrder: {
                _id: order._id,
                productId: order.productId,
                quantity: order.product,
            }, 
            request: {
               type: 'GET',
               url: 'https://localhost3000/orders' + order._id  
            }
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
}) ;


// @desc Handles specific order get request
// @route /:id

router.get('/:id', checkAuth, (req, res, next) => {
    Order.findById(req.params.id)
    .select('productId quantity _id')
    .populate('productId', 'description location price information')
    .exec()
    .then(order => {
        if(!order) {
            return res.status(404).json({
                message: 'Such order does not exist'
            })
        }
        res.status(200).json({
            order: order,
            request: {type: 'GET',
                type: 'GET',
                url: 'localhost:3000/orders'
            }
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
}) ;

// @desc Handles specific order delete request
// @route /:id

router.delete('/:id', checkAuth, (req, res, next) => {
    const id = req.params.id ;
    Order.remove({_id: id})
    .then(result => {
        res.status(200).json({
            message: 'order deleted',
            request: {
                type: 'POST',
                url: 'localhost:3000/orders',
                body: {productId: 'ID', quantity: 'Number'}
            }
        })
    })
    .catch(err => {
        console.log(err) ;
        res.status(500).json({
            message: 'Can not find id'
        })
    })
}) ;

module.exports = router ;
