let path = require('path');

let conf = {
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'main.js',
        publicPath: "dist/",
    },
    devServer: {
        overlay: true
    },
    module:{
        rules: [
            {
                test: /\.js$/,
                exclude: '/(node_modules)/',
                loader: 'babel-loader',
                
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                  {
                    loader: 'file-loader',
                    options: {},
                  },
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader"
                ],

            }              
        ]
    },
}

module.exports =  conf;
(env, options) =>{
    let production = options.mode === 'production'
    conf.devtool = production
                    ? false
                    : 'eval-sourcemap'
    return conf;
};