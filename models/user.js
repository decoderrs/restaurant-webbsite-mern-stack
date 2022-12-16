const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    admin : {
        type : Boolean,
        deafault : false
    }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',User);