var passport = require('passport');

var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

var LocalStrategy = require('passport-local').Strategy;

var jwt = require('jsonwebtoken'); //used to create, sign and verify tokens
var FacebookTokenStrategy = require('passport-facebook-token');
var config = require('./config.js');
var User = require('./models/user');

var opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwtSecret
};

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = () => {
    passport.use(new JwtStrategy(opts,
        (jwt_payload, done) => {
            // console.log("JWT payload: ", jwt_payload);
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

    passport.use(new LocalStrategy(
        (username, password, done) => {
            // console.log("Local data :", username, password);
            User.findOne({ username: username }, function (err, user) {
                // console.log("verify User", user);
                if (err) {
                    return done(err);
                }
                else if (user == null) {
                    return done(null, false);
                }
                return done(null, user);
            });
        }
    ))

    passport.use(new FacebookTokenStrategy({
        clientID: config.facebook.clientId,
        clientSecret: config.facebook.clientSecret
    }, (accessToken, refreshToken, profile, done) => {
        User.findOne({ facebookId: profile.id }, 
            (err, user) => {
            if (err) {
                return done(err, false);
            }
            if (!err && user !== null) {
                // console.log('Good to be here',user);
                return done(null, user);
            }
            else {
                // console.log('Register here');
                user = new User({ username: profile.displayName });
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save((err, user) => {
                    if (err) {
                        return done(err, false);
                    }
                    else {
                        // console.log('Facebook auth',user);
                        return done(null, user);
                    }
                });
            }
        });
    }
    ));

    return {
        initialize: () => {
            return passport.initialize();
        },
        authenticate: () => {
            return passport.authenticate("jwt", config.jwtSession);
        },
        verifyAdmin: (req, res, next) => {
            // console.log("verify Admin", req.user);
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
            return passport.authenticate("local", config.jwtSession);
        },
        facebookPassport: () => {
            return passport.authenticate('facebook-token',config.jwtSession);
        }
    }
}
 

