const jwt = require('jsonwebtoken') ;

// Middle ware that checks whether a route should be protected or not. 
module.exports = (req, res, next) => {
    // the method verify throws an err if it fails, that is why I use try and catch.
    try {
        // Better to add the token as a request header rather tham request body. 
        const token = req.headers.authorization.split(' ')[0] ;
        const encoded = jwt.verify(token, process.env.JWT_KEY) 
        req.userData = encoded 
        next()
    } catch (error) {
        res.status(401).json({
            message: 'Not authorized'
        })
    }
}