const express =  require('express') ;
const app = express() ;

// Configure dotenv (Loads environment variable)
require('dotenv').config() ;

// Configure cors
const cors = require('cors')
app.use(cors()) ;
app.use(express.json())

// configure body-parser
const bodyParser = require('body-parser') ;
app.use(bodyParser.urlencoded({ extended: false })) ;
app.use(bodyParser.json()) ;

// Configure morgan
const morgan = require('morgan') ;
app.use(morgan('dev'))

// Configure mongoDB and connect mongoose
const mongoose = require('mongoose')
const uri = process.env.ATLAS_URI ; 
mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
})

const connection = mongoose.connection ;
connection.once('open', () => {
    console.log('database connected successfully')
})

const port = process.env.PORT || 3000 ;

// Routes
const productRoute = require('./routes/product') ;
app.use('/products', productRoute)

const orderRoute = require('./routes/orders') ;
app.use('/orders', orderRoute)

const userRoute = require('./routes/users') ;
app.use('/users', userRoute) 

app.use('/upload', express.static('./uploads'))

// Handle errors
app.use((req, res, next) => {
    const error = new Error('Not found!') ;
    error.status = 404;
    next(error) ;
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        }
    })
})

app.listen(port, () => {
    console.log(`app running on port ${port}`)
})


