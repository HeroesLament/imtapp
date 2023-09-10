var OpenTelemetryGASExporter = {
    ENDPOINT: 'https://ingest.us.signoz.cloud/v1/traces:443',

    // Your ingestion key
    INGESTION_KEY: 'd3ac4f5e-9515-4403-a224-d32655834c7a',

    createSpan: function(name) {
        return {
            name: name,
            startTime: new Date().toISOString(),
            endTime: null,
            events: [], // You can initialize an events array to store the events.
            setAttribute: function(key, value) {
                this[key] = value;
            },
            addEvent: function(eventName, eventAttributes) {
                this.events.push({
                    name: eventName,
                    attributes: eventAttributes,
                    timestamp: new Date().toISOString()
                });
            }
        };
    },

    endSpan: function(span) {
        span.endTime = new Date().toISOString();
    },

    export: function(span) {
        var payload = {
            spans: [span]
        };

        // Log the payload to the console for inspection
        console.log('Sending request with details: ', {
            payload: JSON.stringify(payload),
            headers: {
                "signoz-access-token": this.INGESTION_KEY,
                "Content-Type": 'application/json'
            },
            contentType: 'application/json'
        });

        var options = {
            method: 'POST',
            contentType: 'application/json',
            headers: {
                "signoz-access-token": this.INGESTION_KEY,
                'muteHttpExceptions': true
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
