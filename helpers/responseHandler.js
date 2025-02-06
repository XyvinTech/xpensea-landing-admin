module.exports = (res, statusCode, message, data = null, totalCount = null) => {
    const response = {
        success: statusCode >= 200 && statusCode < 300,
        message
    };

    if (data) response.data = data;
    if (totalCount) response.totalCount = totalCount;

    return res.status(statusCode).json(response);
}; 