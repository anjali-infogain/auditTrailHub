const responseHandler = {
  success: (res, message = 'Success', data = null, statusCode = 200) => {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  error: (
    res,
    message = 'Something went wrong',
    statusCode = 500,
    error = null
  ) => {
    res.status(statusCode).json({
      success: false,
      message,
      error: error ? error.toString() : undefined,
    });
  },
};

module.exports = responseHandler;
