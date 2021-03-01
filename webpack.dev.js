const TSConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path')
const webpack = require('webpack')


module.exports = {
    mode:'development',
    entry: {
        main:{
            import:'./src/index.ts',
        }
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
    }, 
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        host:'0.0.0.0',
        port: 9000,
        disableHostCheck: true,
        open: true,
        https: false,
        mimeTypes: { 
            'application/octet-stream': []      
        },
        headers: {
            'x-content-type-options':'nosniff'
        },
        openPage: 'http://localhost:9000'
    },
    resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.ts', '.tsx', '.js'],
        plugins: [new TSConfigPathsPlugin({
            baseUrl : './src'
        })]
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            {
                test: /\.ts?$/, 
                loader: 'ts-loader',
                options: { allowTsInNodeModules: true }
            }
        ]    
    }
}
