const constants = {
  RESPONSE_MESSAGES: {
    SUCCESS: 'Success',
    ERROR: 'Something went wrong',
    NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Unauthorized access',
    BAD_REQUEST: 'Invalid request',
    SERVER_ERROR: 'Server Error',
    AUDIT_CYCLE_SAVE_FAIL: 'Failed to save audit cycle',
    AUDIT_CYCLE_DELETE_SUCCESS: 'AuditCycle deleted successfully',
    AUDIT_CYCLE_CREATED: 'Audit cycle added',
    NO_FILE_ADDED: 'No file uploaded',
    AUDIT_CYCLE_ID_MISSING: 'Audit Cycle is missing',
    AUDIT_CYCLE_NOT_FOUND: 'AuditCycle not found',
    ARTIFACT_CREATE_SUCCESS: 'File uploaded & artifact created',
    ARTIFACT_DELETED: 'Artifact deleted',
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
