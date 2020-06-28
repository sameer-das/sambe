const jwt = require('jsonwebtoken');
const Configuration = require('../configurations/authconfig');

const authenticate = async (req, res, next) => {
    // console.log('Authenticating');
    try {
        const token = req.header('authorization').replace('Bearer ', '');
        // console.log(token);
        const decoded = jwt.verify(token, Configuration.jwt_secret);
        req.user_name = decoded.userAuthDetails.username;
        req.user_role = decoded.userAuthDetails.role_name;
        next();
    } catch (err) {
        res.status(401).json({
            success: false,
            data: null,
            message: 'Unauthorized!',
            error: err
        })
    }
}

const authorize = (roles) => {
    return async (req, res, next) => {
        if(roles.includes(req.user_role.toLowerCase())) {
            next();
        } else {
            res.status(403).json({
                success: false,
                data: null,
                message: 'Forbidden!',
            })
        }
    }
}

module.exports = { authenticate, authorize };