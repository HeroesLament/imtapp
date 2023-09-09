var OpenTelemetryGASExporter = {

    ENDPOINT: 'ingest.us.signoz.cloud:443',

    createSpan: function(name) {
        return {
            name: name,
            startTime: new Date().toISOString(),
            endTime: null
        };
    },

    endSpan: function(span) {
        span.endTime = new Date().toISOString();
    },

    export: function(span) {
        var payload = {
            spans: [span]
        };

        var options = {
            method: 'POST',
            contentType: 'application/json',
            payload: JSON.stringify(payload)
        };

        try {
            UrlFetchApp.fetch(this.ENDPOINT, options);
        } catch (error) {
            Logger.log('Failed to export span: ' + error.toString());
        }
    }
};
