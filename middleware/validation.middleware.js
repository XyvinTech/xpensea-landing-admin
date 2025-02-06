const responseHandler = require('../helpers/responseHandler');

const validateRequest = (schema, options = { abortEarly: true }) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, options);
        
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            res.status(400).errorMessage = errorMessage;
            return responseHandler(res, 400, res.errorMessage);
        }
        
        next();
    };
};

module.exports = validateRequest; 