// This would be your 'http-shim.js' file
const UrlFetchApp = this.UrlFetchApp; // Assuming 'this' is the global context in Google Apps Script

const httpShim = (() => {
  function request(url, options, callback) {
    if (typeof url === 'string') {
      // If the first argument is a string, it is the URL
      url = new URL(url);
    } else {
      // If the first argument is an object, it contains the options
      callback = options;
      options = url;
      url = new URL(options.protocol + '//' + options.hostname + options.path);
    }

    if (typeof options === 'function') {
      callback = options;
      options = undefined;
    }

    const method = (options && options.method) || 'GET';
    const headers = (options && options.headers) || {};
    const payload = (options && options.body) || null;

    // Convert Node.js buffer to a string for UrlFetchApp
    if (payload && Buffer.isBuffer(payload)) {
      payload = payload.toString();
    }

    const fetchOptions = {
      method: method,
      headers: headers,
      muteHttpExceptions: true // Handle HTTP exceptions manually
    };

    if (payload) {
      fetchOptions.payload = payload;
    }

    try {
      const response = UrlFetchApp.fetch(url.toString(), fetchOptions);
      const res = {
        statusCode: response.getResponseCode(),
        headers: response.getHeaders(),
        body: response.getContentText(),
        setEncoding: () => {}, // Encoding is not supported in UrlFetchApp
        on: (event, listener) => {
          // We only implement the 'data' and 'end' events for this shim
          if (event === 'data') {
            listener(response.getContentText());
          }
          if (event === 'end') {
            listener();
          }
        }
      };
      
      if (callback) {
        callback(res);
      }
      
      // Return a mock request object
      return {
        on: () => {}, // Event listener not really supported here
        end: () => {},
        write: () => {}, // For sending request bodies, which UrlFetchApp does not support in a streaming manner
        abort: () => {} // For aborting requests, not supported in UrlFetchApp
      };
    } catch (e) {
      if (callback) {
        callback(e);
      }
    }
  }

  return {
    request: request,
    get: (url, options, callback) => {
      if (typeof options === 'function') {
        callback = options;
        options = undefined;
      }
      const opts = Object.assign({}, options, { method: 'GET' });
      return request(url, opts, callback);
    }
  };
})();

// Mock the https module in a similar way
const httpsShim = { ...httpShim };

// Export the shims
// In a CommonJS-style environment you might use:
// module.exports.http = httpShim;
// module.exports.https = httpsShim;

module.exports.http = { httpShim };
module.exports.https = { httpsShim };
// In Google Apps Script, you would just use them directly
// or assign them to global variables if needed
