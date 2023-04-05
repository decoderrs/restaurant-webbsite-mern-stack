const express = require('express');
const bodyParser = require('body-Parser');
const mongoose = require('mongoose');
var auth = require('../authenticate')();
const Dishes = require('../models/dishes');
const cors = require('./cors');
const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
.options(cors.corsWithOptions, (req,res) => {res.sendStatus(200);})
    .get(cors.cors,(req, res, next) => {
        Dishes.find(req.query)
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions,auth.authenticate(), (req, res, next) => auth.verifyAdmin(req, res, next), (req, res, next) => {
        // console.log('posting dishes',req.body);
        Dishes.create(req.body)
            .then((dish) => {
                console.log('Dish created ', dish);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions,auth.authenticate(), (req, res, next) => auth.verifyAdmin(req, res, next), (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operations not supported on /dishes');
    })
    .delete(cors.corsWithOptions,auth.authenticate(), (req, res, next) => auth.verifyAdmin(req, res, next), (req, res, next) => {
        Dishes.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((errr) => next(err));
    });

//{"name" : "panner tikka masala" , "description" : "spicy"}
dishRouter.route('/:dishId')
.options(cors.corsWithOptions, (req,res) => {res.sendStatus(200);})
    .get(cors.cors,(req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions,auth.authenticate(), (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/' + req.params.dishId);
    })
    .put(cors.corsWithOptions,auth.authenticate(), (req, res, next) => {
        Dishes.findByIdAndUpdate(req.params.dishId, {
            $set: req.body
        }, { new: true })
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions,auth.authenticate(), (req, res, next) => {
        Dishes.findByIdAndRemove(req.params.dishId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });



module.exports = dishRouter;

