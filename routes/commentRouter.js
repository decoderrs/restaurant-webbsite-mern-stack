const express = require('express');
const bodyParser = require('body-Parser');
const mongoose = require('mongoose');

var auth = require('../authenticate')();

const Dishes = require('../models/dishes');
const Comments = require('../models/comments');

const cors = require('./cors');

const commentRouter = express.Router();

commentRouter.use(bodyParser.json());

commentRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Comments.find(req.query)
            .populate('author')
            .then((comments) => {
                if (dish != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(comments);
                }
                else {
                    err = new Error('Dish ' + req.params.dishId + ' not found ');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, auth.authenticate(), (req, res, next) => {
        if (req.body != null) {
            req.body.author = req.user._id;
            Comments.create(req.body)
                .then((comment) => {
                    Comments.findById(comment._id)
                        .populate('author')
                        .then((comment) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(comment);
                        })
                }, (err) => next(err))
                .catch((err) => next(err));
        }
        else {
            err = new Error('Comment not found in request body');
            err.status = 404;
            return next(err);
        }
    })
    .put(cors.corsWithOptions, auth.authenticate(), (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes/' + req.params.dishId + '/comments');
    })
    .delete(cors.corsWithOptions, auth.authenticate(), (req, res, next) => auth.verifyAdmin(req, res, next), (req, res, next) => {
        Comments.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err));
    }
    );

commentRouter.route('/:commentId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Comments.findById(req.params.commentId)
            .populate('author')
            .then((comment) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(comment);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, auth.authenticate(), (req, res, next) => {
        res.statusCode = 401;
        res.end('POST operation not supported on /comments/' + req.params.commentId +
            '/comments/' + req.params.commentId);
    })
    .put(cors.corsWithOptions, auth.authenticate(), (req, res, next) => {
        Dishes.findById(req.params.commentId)
            .then((comment) => {
                if (comment != null) {
                    if (comment.author.equals(req.user._id)) {
                        var err = new Error('Your are not authorized to update this comment!');
                        err.status = 403;
                        return next(err);
                    }
                    req.body.author = req.user._id;
                    Comments.findByIdAndUpdate(req.params.commentId, {
                        $set: req.body
                    }, { new: true })
                        .then((comment) => {
                            Comments.findById(comment._id)
                                .populate('author')
                                .then((comment) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(comment);
                                })
                        }, (err) => next(err))
                }
                else {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, auth.authenticate(), (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((comment) => {
                // console.log("cosmos",dish.comments," try ",req.user._id);
                if (comment != null) {
                    if (!comment.author.equals(req.user._id)) {
                        var err = new Error('You are not authorized to delete this comment!');
                        err.status = 403;
                        return next(err);
                    }
                    Comments.findByIdAndRemove(req.params.commentId)
                        .then((dish) => {
                           res.statusCode = 200; 
                           res.setHeader('Content-Type','application/json');
                           res.json(resp);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = commentRouter;