const successResponse = (res, data = {}, message = "Operation completed successfully.", statusCode = 200) => {
    res.status(statusCode).json({
        status: "success",
        message: message,
        data: data,
        error: null
    });
};

const errorResponse = (res, error = {}, message = "An error occurred.", statusCode = 500) => {
    res.status(statusCode).json({
        status: "error",
        message: message,
        data: null,
        error: error
    });
};

module.exports={
    successResponse,
    errorResponse
}
