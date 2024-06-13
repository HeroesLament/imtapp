function doGet(request) {
    // Check if any action parameters are provided
    if (request.parameter.action) {
        const headers = {
            'Access-Control-Allow-Origin': '*'
        };
        // Route to the API handler if an action parameter is present
        return router(request);
    } else {
        const headers = {
            'Access-Control-Allow-Origin': '*', // Adjust according to your security policies
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        };
        // Serve the default HTML page if no parameters are specified
        return HtmlService.createTemplateFromFile('Page')
                          .evaluate()
                          .setTitle("KVRS IMS - Member Assignment Module")
                          // Unsure if Headers statement will cause issues; remove if problematic
                          .setHeaders(headers);
    }
}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}