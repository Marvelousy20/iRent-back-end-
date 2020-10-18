const express = require('express') ;

const router = express.Router() ;

const Product = require('../models/products')

const checkAuth = require('../middleware/check-auth')

// configure multer
const multer = require('multer');

// configure storage and filename
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },

    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})


// Accept or reject files
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        // accept file
        cb(null, true)
    }

    else {
        // reject file
        cb(null, false)
    }
}

// set configuration for multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 
    },
    fileFilter: fileFilter,
})

// to use the id
const mongoose = require('mongoose')

// @desc Handles products get request
// @route /

router.get('/', (req, res, next) => {
    Product.find().select('description location information price, productImage')
    .exec()
    .then(results => {
        const response = {
            length: results.length,
            product: results.map(result => (
                {
                    _id: result._id,
                    description: result.description,
                    location: result.location,
                    infomation: result.infomation,
                    price: result.price,
                    productImage: result.productImage,
                    // send get request to individual product
                    request: {
                        type: 'GET',
                        url: 'https://localhost/3000/products' + result._id 
                    }
                }   
            ))
        }

        res.status(200).json(response)
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            message: 'Cannot get products'
        }) 
    })
}) ;

// @desc Handles products post request
// @route /add

router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
    console.log(req.file)
    const _id = new mongoose.Types.ObjectId()
    const description = req.body.description ;
    const location = req.body.location ;
    const information = req.body.information ;
    const price = req.body.price ;
    const productImage = req.file.path

    console.log(productImage)
    
    const product = new Product({
        _id,
        description,
        location,
        information,
        price,
        productImage
    })
    .save()
    .then(result => {
        res.status(201).json({
            message: 'Post product'
        })
    })
    .catch(err => {
        console.log(err) ;
        res.status(500).json('Failed to post')
    })
}) ;


// @desc Handles specific products get request
// @route /:id

router.get('/:id', (req, res, next) => {

    const id = req.params.id

    Product.findById({_id: id}).select('description location information price productImage')
    .exec()
    .then(result => {
        if(result) {
            const response = {
                _id: result._id,
                description: result.description,
                location: result.location,
                infomation: result.infomation,
                price: result.price,
                productImage: result.productImage,
                // Send get request to get all products
                request: {
                    type: 'GET',
                    url: 'https://localhost:3000/products'
                }
            }
            res.status(200).json(response) 
        }
        else {
            res.status(404).json({
                message: "No valid product with such ID"
            })
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
}) ;

// @desc Handles specific products delete request
// @route /:id

router.delete('/:id', checkAuth, (req, res, next) => {
    const id = req.params.id ;
    Product.findByIdAndDelete(id)
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'product deleted'
        })
    })
    .catch(err => {
        console.log(err) ;
        res.status(500).json({
            message: 'Can not find id'
        })
    })
}) ;

// @desc Handles specific products update request
// @route /:id

router.patch('/:id', checkAuth, (req, res, next) => {
    const id = req.params.id ; 

    const updateOps = {} ;

    for(let ops of req.body) {
        updateOps[ops.propName] = ops.newValue;
    }

    Product.findByIdAndUpdate(id, {$set: updateOps}) 
    .then(result => {
        res.status(200).json({
            message: 'Updated product'
        })
    })
    .catch(err => {
        console.log(err) ;
        res.status(500).json({
            message: 'Bad request'
        })
    })
}) ;

module.exports = router ;

