const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var user = new Schema({
    username : {
        type: String,
        unique : true,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    admin : {
        type : Boolean,
        deafault : false
    }
});

module.exports = mongoose.model('User',user);