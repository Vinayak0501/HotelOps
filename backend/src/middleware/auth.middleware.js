const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;


const tokenVerificationMiddleware = function(req, res, next){

    try{

        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer ')){
            
            return res.status(401).json({
                message: 'Not authorized, token missing'
            });

        }

        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, JWT_SECRET);

        // attach minimal user info (from token)

        req.user = {
            id: decodedToken.id,
            role: decodedToken.role,
            hotelId: decodedToken.hotelId
        };
        // console.log(req.user);

        next();
    }

    catch(err){

        return res.status(401).json({
            message: 'Not authorized, token invalid'
        });

    }
}

module.exports = { tokenVerificationMiddleware };