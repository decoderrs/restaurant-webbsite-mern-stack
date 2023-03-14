const express = require('express');
const bodyParser = require('body-Parser');
const Leader = require('../models/leaders');

var auth = require('../authenticate')();

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
    .get((req, res, next) => {
        Leader.find({})
            .then((leader) => {
                console.log(leader);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leader);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(auth.authenticate(),(req,res,next) => auth.verifyAdmin(req,res,next),(req, res, next) => {
        Leader.create(req.body)
            .then((leader) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leader);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(auth.authenticate(),(req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operations not supported on /leaders');
    })
    .delete(auth.authenticate(),(req,res,next) => auth.verifyAdmin(req,res,next),(req, res, next) => {
        Leader.remove({})
            .then((leader) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leader);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

leaderRouter.route('/:leaderId')
    .get((req, res, next) => {
        Leader.findById(req.params.leaderId)
            .then((leader) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leader);
            }), (err) => next((err))
                .catch((err) => next(err));
    })
    .post(auth.authenticate(),(req,res,next) => auth.verifyAdmin(req,res,next),(req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /leaders/' + req.params.leaderId);
    })
    .put(auth.authenticate(),(req,res,next) => auth.verifyAdmin(req,res,next),(req, res, next) => {
        Leader.findByIdAndUpdate(req.params.leaderId)
        .then((leader)=> {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(leader);
        } , (err) => next(err))
        .catch(( err) => next(err));
         })
    .delete(auth.authenticate(),(req,res,next) => auth.verifyAdmin(req,res,next),(req, res, next) => {
        Leader.findByIdAndDelete(req.params.leaderId)
        .then((leader)=> {
            res.statusCode = 200;
            res.setHeader('Cotent-Type','application/json');
            res.json(leader);
        } , (err) => next(err))
        .catch((err) => next(err));
      });

module.exports = leaderRouter;


