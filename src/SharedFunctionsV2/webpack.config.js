const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

// Determine the mode from the environment, default to 'production'
const mode = process.env.NODE_ENV || 'production';

module.exports = {
    mode: mode,
    // entry: path.resolve(__dirname, 'src', 'dummy.js'), // Point to the dummy file
    entry: {
        dummy: './src/dummy.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: {
            name: '[name]',
            type: 'var'
        },
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'src/Common IMS Data.js', to: 'Common IMS Data.js' },
                { from: 'src/Data Validation.js', to: 'Data Validation.js' },
                { from: 'src/Spreadsheet Mapper.js', to: 'Spreadsheet Mapper.js' },
                { from: 'src/Template Manipulation.js', to: 'Template Manipulation.js' },
                ...(mode === 'development' ? [{ from: 'src/tests.js', to: 'tests.js' }] : []),
            ],
        }),
    ],
    optimization: {
        minimize: mode === 'production',
    },
    externals: {
        dummy: 'dummy'
    },
};