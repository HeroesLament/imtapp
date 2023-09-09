var OpenTelemetryGASExporter = {
    ENDPOINT: 'https://ingest.us.signoz.cloud:443',

    // Your ingestion key
    INGESTION_KEY: 'd3ac4f5e-9515-4403-a224-d32655834c7a',

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
            headers: {
                "signoz-access-token": this.INGESTION_KEY
            },
            payload: JSON.stringify(payload)
        };

        try {
            UrlFetchApp.fetch(this.ENDPOINT, options);
        } catch (error) {
            Logger.log('Failed to export span: ' + error.toString());
        }
    }
};
