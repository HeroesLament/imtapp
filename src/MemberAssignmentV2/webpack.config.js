const path = require('path');

module.exports = {
    mode: 'production',
    entry: {
        main: path.resolve('./src', 'otlp.js'),
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'Otlp.js',
        library: {
            name: 'Otlp',
            type: 'var'
        },
    },
};