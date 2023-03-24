const express = require('express');
const cors  = require('cors');
const app = express();

const whitelist = ['http://localhost:3000', 'https://localhost:3443','http://localhost:3001'];

var CorsOptionsDelegate = (req,callback) => {
    var corsOptions;
    console.log('CORS ORIGIN',req.header('origin'));
    if( whitelist.indexOf(req.header('Origin')) !== -1) {
        console.log('Checking here');
        corsOptions = {origin: true};
    }
    else {
        corsOptions = { origin: false};
    }
    callback(null, corsOptions);
}

exports.cors = cors();
exports.corsWithOptions = cors(CorsOptionsDelegate);