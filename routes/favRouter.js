var express = require('express');
var bodyParser = require('body-Parser');

var favRouter = express.Router();

var Favorite = require('../models/favorites');
var auth = require('../authenticate.js')();
var cors = require('./cors');
const user = require('../models/user');
const Dishes = require('../models/dishes');
const favorites = require('../models/favorites');

favRouter.use(bodyParser.json());

favRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, auth.authenticate(), (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate('user')
            .populate('dishes')
            .then((fav) => {
                if (fav != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav);
                }
                else {
                    err = new Error('No favorite dishes added!');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, auth.authenticate(), (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .populate('user')
            .populate('dishes')
            .then((fav) => {
                if (fav != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav);
                }
                else {
                    err = new Error('No favorite dish found to delete!!');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

favRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .post(cors.corsWithOptions, auth.authenticate(), (req, res, next) => {
        // console.log('fav option', req.user._id);
        Favorite.findOne({ user: req.user._id })
            .then((fav) => {
                // console.log("data ", fav);
                if (fav === null) {
                    // console.log('No fav doc found!', fav);
                    Favorite.create(
                        { user: req.user._id }
                    )
                        .then((favor) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favor);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
                else {
                    // console.log('fav schema found ', fav);
                    Dishes.findById(req.params.dishId)
                        .then((dish) => {
                            // console.log("dish to be added",dish.$isEmpty(), dish != null && fav.dishes.findIndex((current) => {return (current == req.params.dishId);}) != -1);
                            if ((dish != null) && (fav.dishes.findIndex((current) => { return (current == req.params.dishId); }) == -1)) {
                                // console.log("dish added");
                                fav.dishes.push(req.params.dishId);
                                fav.save()
                                    .then((favdish) => {
                                        res.status = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(fav);
                                    }, err => next(err))
                                    .catch((err) => next(err));
                            }
                            else if ((dish != null) && (fav.dishes.findIndex((current) => { return (current == req.params.dishId); }) != -1)) {
                                // console.log('dish already added');
                                err = new Error('Dish ' + req.params.dishId + ' is already added to favorites!!');
                                err.status = 403;
                                return next(err);
                            }
                            else {
                                err = new Error('Dish ' + req.params.dishId + ' does not exist!!');
                                err.status = 404;
                                return next(err);
                            }
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    }
    )
    .delete(cors.corsWithOptions, auth.authenticate(), (req, res, next) => {
        console.log('user validate', req.user._id);
        Favorite.findOne({ user: req.user._id })
            .populate('dishes')
            .then((fav) => {
                console.log('check logic', fav, fav != null && fav.dishes.length != 0);
                if (fav != null && fav.dishes.length != 0) {
                    for (var i = 0; i < fav.dishes.length; i++) {
                        // console.log('Search dish', fav.dishes[i]._id.equals(req.params.dishId),fav.dishes.remove(req.params.dishId));
                        console.log('before deleting', i);
                        fav.dishes.remove(req.params.dishId);
                        console.log('after deleting');
                        fav.save()
                            .then((dish) => {
                                if (dish != null) {
                                    res.sendStatus = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(dish);
                                }
                                else {
                                    console.log('dish not found');
                                    err = new Error('Dish ' + req.params.dishId + ' does not exist!')
                                    err.status = 404;
                                    return next(err);
                                }
                            }, (err) => { return (next(err)); })
                            .catch((err) => next(err));
                    }
                }
                else {
                    err = new Error('Favorite ' + fav._id + ' does not exist for ' + req.user._id + ' user');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })

module.exports = favRouter;