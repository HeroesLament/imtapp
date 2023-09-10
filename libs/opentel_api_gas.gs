var OpenTelemetryGASExporter = {
    ENDPOINT: 'https://ingest.us.signoz.cloud/v1/traces:443',
    INGESTION_KEY: 'd3ac4f5e-9515-4403-a224-d32655834c7a',

    // New Classes
    Span: function() {
        this.trace_id = null;
        this.span_id = null;
        this.trace_state = '';
        this.status = new this.Status();
        // ... Add more fields as necessary ...

        // Add member functions to the Span class if needed.
        this.someMethod = function() {
            // Do something
        };
    },

    Status: function() {
        this.message = '';
        this.code = 0;  // Defaulting to STATUS_CODE_UNSET
    },

    createSpan: function(name) {
        let span = new this.Span();
        span.name = name;
        span.startTime = new Date().toISOString();
        span.endTime = null;
        span.events = []; // You can initialize an events array to store the events.
        
        // Adding helper methods directly on the span instance.
        span.setAttribute = function(key, value) {
            this[key] = value;
        };

        span.addEvent = function(eventName, eventAttributes) {
            this.events.push({
                name: eventName,
                attributes: eventAttributes,
                timestamp: new Date().toISOString()
            });
        };
        
        return span;
    },

    serializeToProtobufInJSON: function(span) {
        let protobufInJSON = {};

        // Convert trace_id and span_id from their current format to bytes (perhaps Base64 encoded)
        protobufInJSON.trace_id = this.base64Encode(span.trace_id);
        protobufInJSON.span_id = this.base64Encode(span.span_id);
    
        // Directly map the span name
        protobufInJSON.name = span.name;
    
        // Convert ISO strings to UNIX nano timestamps for start and end times
        protobufInJSON.start_time_unix_nano = this.isoToUnixNano(span.startTime);
        protobufInJSON.end_time_unix_nano = this.isoToUnixNano(span.endTime);
    
        // Transform events
        protobufInJSON.events = span.events.map(event => ({
            name: event.name,
            attributes: event.attributes,  // Assuming attributes are already in a compatible format
            timestamp: isoToUnixNano(event.timestamp)
        }));
        return protobufInJSON;
    },

    // Helper function to convert ISO string to UNIX nano timestamp
    isoToUnixNano: function(isoString) {
        return new Date(isoString).getTime() * 1e6;  // Convert to nanoseconds
    },

    // Helper function to Base64 encode a value (this is just an example; actual encoding may vary)
    base64Encode: function(value) {
        return Utilities.base64Encode(value);
    },

    endSpan: function(span) {
        span.endTime = new Date().toISOString();
    },

    export: function(span) {
        let payload = {
            spans: [span]
        };

        // Log the payload to the console for inspection
        console.log('Sending request with details: ', {
            payload: JSON.stringify(payload),
            headers: {
                "signoz-access-token": this.INGESTION_KEY,
                "Content-Type": 'application/json',
                'muteHttpExceptions': true
            },
            contentType: 'application/json'
        });

        let options = {
            method: 'POST',
            contentType: 'application/json',
            headers: {
                "signoz-access-token": this.INGESTION_KEY
            },
            muteHttpExceptions: true,
            payload: JSON.stringify(payload)
        };

        try {
            let response = UrlFetchApp.fetch(this.ENDPOINT, options);
            if (response.getResponseCode() !== 200) {
                console.log('Error: ' + response.getContentText());
            }
        } catch (error) {
            console.log('Failed to export span: ' + error.toString());
        }
    }
};
