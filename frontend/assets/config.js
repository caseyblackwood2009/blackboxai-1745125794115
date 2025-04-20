/**
 * Configuration for API base URL.
 * 
 * For local development, set to 'http://localhost:5000/api'
 * For production, set to '/shortner/api' or appropriate path.
 * 
 * Update this file before deployment or testing.
 */

const API_BASE_URL = (function() {
  // Change this flag to true for local development, false for production
  const DEVELOPER_MODE = true;

  if (DEVELOPER_MODE) {
    return 'http://localhost:5000/api';
  } else {
    return '/shortner/api';
  }
})();

export default API_BASE_URL;
