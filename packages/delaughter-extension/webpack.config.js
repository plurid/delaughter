const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');



const DEVELOPMENT = 'development';
const {
    NODE_ENV = DEVELOPMENT,
} = process.env;


const outputPath = path.join(__dirname, 'distribution');


const base = {
    context: __dirname,
    entry: {
        contentscript: NODE_ENV === DEVELOPMENT
            ? './source/collectionscript/index.tsx'
            : './source/contentscript/index.ts',
        popup: './source/popup/index.tsx',
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        alias: {
            "~common": path.resolve(__dirname, "source/common"),
            "~collectionscript": path.resolve(__dirname, "source/collectionscript"),
            "~contentscript": path.resolve(__dirname, "source/contentscript"),
            "~data": path.resolve(__dirname, "source/data"),
            "~logic": path.resolve(__dirname, "source/logic"),
            "~popup": path.resolve(__dirname, "source/popup"),
        },
    },
    output: {
        path: outputPath,
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: 'css-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: `./source/manifest.${NODE_ENV === DEVELOPMENT ? 'collection' : 'production'}.json`, to: './manifest.json' },
                { from: './source/assets', to: 'assets' },
                { from: './source/processor/index.js', to: './processor.js' },
            ],
        }),
        new HtmlWebpackPlugin({
            template: './source/popup/index.html',
            chunks: ['popup'],
            filename: 'popup.html',
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(NODE_ENV),

                API_ENDPOINT: JSON.stringify(process.env.API_ENDPOINT),
            },
        }),
    ],
};


const development = {
    ...base,
    mode: 'development',
    devtool: false,
};


const production = {
    ...base,
    mode: 'production',
    plugins: [
        ...base.plugins,
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false,
        }),
    ],
}


if (NODE_ENV === DEVELOPMENT) {
    module.exports = development;
} else {
    module.exports = production;
}
