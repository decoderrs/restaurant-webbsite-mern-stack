var express = require('express');
var bodyParser = require('body-Parser');

var router = express.Router();

var User = require('../models/user');
var passport = require('passport');

var cfg = require('../config.js')
var auth = require('../authenticate.js')();
var cors = require('./cors');
var jwt = require('jwt-simple');

var jsonWt = require('jsonwebtoken');
const { authenticate, session } = require('passport');

router.use(bodyParser.json());

router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); });

router.get('/', cors.cors, auth.verifyUser(), (req, res, next) => auth.verifyAdmin(req, res, next), (req, res, next) => {
  User.find({}, (err, users) => {
    if (err) {
      var err = new Error('No user found');
      err.status = 404;
      res.json({ err: err });
    }
    else if (users) {
      res.json({ users: users });
    }
  })
})

/* GET users listing. */
router.route('/signup')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .post(cors.corsWithOptions, (req, res, next) => {
    User.register(new User({ username: req.body.username }),
      req.body.password, (err, user) => {
        if (err) {
          console.log(err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({ err: err });
        }
        else {
          if (req.body.firstname)
            user.firstname = req.body.firstname;
          if (req.body.lastname)
            user.lastname = req.body.lastname;
          user.save((err, user) => {
            if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.json({ err: err });
            }
            var payload = {
              _id: user._id
            };
            var token = getToken(payload);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, token: token, user: user._id, status: 'Registration Successful!' });
          });
        }
      });
  });

router.route('/login')
  .post(cors.corsWithOptions, (req, res, next) => {
    console.log("good night");
    passport.authenticate('local', (err, user, info) => {
      if (err)
        return next(err);

      if (!user) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: false, status: "Login Unsuccessful!", err: info });
      }
      console.log('login to user', user);
      req.logIn(user, (err) => {
        if (err == null) {
          res.statusCode = 401;
          res.setHeader('Content-Type', "application/json");
          res.json({ success: false, status: 'Login Unsuccessful!',errmess: err, err: 'Could not Login user' });
        }
        else {
          var payload = {
            _id: user._id
          };
          var token = getToken(payload);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: true, token: token, session: req.session, status: 'You are successfully logged in!' });

        }

      });
    })(req, res, next);
  }
  );

router.route('/logout')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .post(cors.corsWithOptions, auth.authenticate(), (req, res, next) => {
    console.log('session', req.session);
    if (req.session) {
      req.session.destroy();
      res.clearCookie('session-id');
      res.redirect('/');
    }
    else {
      var err = new Error('You are not logged in!');
      err.status = 403;
      next(err);
    }
  });

router.get('/facebook/token', auth.facebookPassport(), (req, res) => {
  // console.log('request user',req.user._id)
  if (req.user) {
    var token = getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, token: token, status: 'You are successfully logged in!' });
  }
});

router.get('/checkJWTtoken', cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({ status: 'JWT invalid!', success: false, err: info })
    }
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json({ status: 'JWT valid!', success: true, user: user })
    }
  })(req, res);
});

module.exports = router;

const getToken = function (user) {
  return jsonWt.sign(user, cfg.jwtSecret,
    { expiresIn: 3600 });
};

