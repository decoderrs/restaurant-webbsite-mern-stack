var passport = require('passport');

var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

var LocalStrategy = require('passport-local').Strategy;

var jwt = require('jsonwebtoken'); //used to create, sign and verify tokens

var config = require('./config.js');
var User = require('./models/user');

var opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwtSecret
};

module.exports = () => {
    passport.use(new JwtStrategy(opts,
        (jwt_payload, done) => {
            console.log("JWT payload: ", jwt_payload);
            User.findOne({ _id: jwt_payload._id }, (err, user) => {
                if (err) {
                    return done(new Error('user not found'), false);
                }
                else if (user) {
                    return done(null, user);
                }
                else {
                    return done(null, false);
                }
            });
        }));

    passport.use(new LocalStrategy(User.authenticate()
        // function (username, password, done) {
        //     // console.log("Local data :", username, password);
        //     User.findOne({ username: username }, function (err, user) {
        //         // console.log("Sun shine", user, user.username);
        //         if (err) { return done(err, false); }
        //         else if (!user) { return done(null, false); }
        //         else {return done(null, user);}
        //     });
        // }
    ))
    return {
        initialize: () => {
            return passport.initialize();
        },
        authenticate: () => {
            return passport.authenticate("jwt", config.jwtSession);
        },
        verifyAdmin: (req, res, next) => {
            console.log("Nice weather", req.user);
            if (req.user) {
                if (req.user.admin) {
                    return next();
                }
                else if (!req.user.admin) {
                    err = new Error("You are not authorized to perform this operation!");
                    err.status = 403;
                    return (next(err));
                }
            }
            else {
                err = new Error('User ' + req.user._id + ' not found');
                err.status = 403;
                return next(err);
            }
        }
        ,
        verifyUser: () => {
            return passport.authenticate("local");
        }
    }
}


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
