var express = require('express');
var bodyParser = require('body-Parser');

var router = express.Router();

var User = require('../models/user');
var passport = require('passport');

var cfg = require('../config.js')
var auth = require('../authenticate.js')();
var jwt = require('jwt-simple');

var jsonWt = require('jsonwebtoken');

router.use(bodyParser.json());

router.get('/', auth.authenticate(), (req, res, next) => auth.verifyAdmin(req, res, next), (req, res, next) => {
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
router.post('/signup', (req, res, next) => {
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

router.post('/login', auth.authenticate(),(req, res, next) => {
  console.log("good night");
  var payload = {
    _id: req.user._id
  };
  var token = getToken(payload);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, _id: req.user._id, token: token, session: req.session, status: 'You are successfully logged in!' });
}
);

router.post('/logout', auth.authenticate(),(req, res, next) => {
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

module.exports = router;

const getToken = function (user) {
  return jsonWt.sign(user, cfg.jwtSecret,
    { expiresIn: 3600 });
};

