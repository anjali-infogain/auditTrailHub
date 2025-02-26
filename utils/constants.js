const constants = {
  RESPONSE_MESSAGES: {
    SUCCESS: 'Success',
    ERROR: 'Something went wrong',
    NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Unauthorized access',
    BAD_REQUEST: 'Invalid request',
  },

  STATUS_CODES: {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
  },
};

module.exports = constants;
