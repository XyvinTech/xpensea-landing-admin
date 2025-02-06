const jwt = require('jsonwebtoken');
const responseHandler = require('../helpers/responseHandler');

exports.authenticate = (req, res, next) => {
    const bearerHeader = req.header('Authorization');

    if (!bearerHeader) {
        res.status(401).errorMessage = 'No token, authorization denied';
        return responseHandler(res, 401, res.errorMessage);
    }

    try {
        const token = bearerHeader.startsWith('Bearer ') 
            ? bearerHeader.split(' ')[1] 
            : bearerHeader;

        req.tenant = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).errorMessage = 'Token is not valid';
        return responseHandler(res, 401, res.errorMessage);
    }
}; 