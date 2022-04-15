const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const Dotenv = require('dotenv-webpack');
require('dotenv').config();

module.exports = {
    entry: {
        main: "./src/main.js",
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname,  "dist")
    },
    devServer: {
        port: 8081
    },
    plugins: [
        new Dotenv(),
        new HtmlWebpackPlugin({
            template: "index.html",
            chunks: ["main"],
            // Pass the full url with the key!
            newChain: process.env.NEW_CHAIN_ID,
            oldChain: process.env.OLD_CHAIN_ID
        })
    ]
};
