const { v4: uuidv4 } = require('uuid');

/**
 * Generates a unique filename using timestamp and random bytes.
 * @param {string} originalName - The original file name (optional).
 * @returns {string} Unique file name
 */
const generateUniqueFileName = (originalName = '') => {
  const timestamp = Date.now();
  const uniqueId = uuidv4().split('-')[0];
  const extension = originalName.split('.').pop(); // Extract extension if available
  return `artifact_${timestamp}_${uniqueId}.${extension}`;
};

module.exports = { generateUniqueFileName };
