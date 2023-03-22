const express = require('express');
const mongoose = require('mongoose');
const bodyParser= require('body-Parser');
const Promotions = require('../models/promotions');
var auth =require('../authenticate')();
var cors = require('./cors');
const promotionRouter = express.Router();

promotionRouter.use(bodyParser.json());

promotionRouter.route('/')
.options(cors.corsWithOptions, (req,res) => {res.sendStatus(200);})
.get( cors.cors,(req, res, next) => {
    Promotions.find(req.query)
        .then((promotion) => {
            console.log(promotion);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);
        }, (err) => next(err))
        .catch((err) => next(err));
})
.post(cors.corsWithOptions,auth.authenticate(), (req,res,next) => auth.verifyAdmin(req,res,next),(req, res, next) => {
    Promotions.create(req.body)
        .then((promotion) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);
        }, (err) => next(err))
        .catch((err) => next(err));
})
.put(cors.corsWithOptions,auth.authenticate(), (req,res,next) => auth.verifyAdmin(req,res,next),(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operations not supported on /Promotionss');
})
.delete(cors.corsWithOptions,auth.authenticate(), (req,res,next) => auth.verifyAdmin(req,res,next),(req, res, next) => {
    Promotions.remove({})
        .then((promotion) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);
        }, (err) => next(err))
        .catch((err) => next(err));
});
    
promotionRouter.route('/:promotionId')
.options(cors.corsWithOptions, (req,res) => {res.sendStatus(200);})
.get(cors.cors,(req, res, next) => {
    Promotions.findById(req.params.promotionId)
        .then((promotion) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);
        }), (err) => next((err))
            .catch((err) => next(err));
})
.post(cors.corsWithOptions,auth.authenticate(), (req,res,next) => auth.verifyAdmin(req,res,next),(req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /Promotionss/' + req.params.PromotionsId);
})
.put(cors.corsWithOptions,auth.authenticate(),(req,res,next) => auth.verifyAdmin(req,res,next), (req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.promotionId)
    .then((promotion)=> {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion);
    } , (err) => next(err))
    .catch(( err) => next(err));
     })
.delete(cors.corsWithOptions,auth.authenticate(), (req,res,next) => auth.verifyAdmin(req,res,next),(req, res, next) => {
    Promotions.findByIdAndDelete(req.params.promotionId)
    .then((promotion)=> {
        res.statusCode = 200;
        res.setHeader('Cotent-Type','application/json');
        res.json(promotion);
    } , (err) => next(err))
    .catch((err) => next(err));
  });

//{"name" : "Manager" , "description" : "promoted from team lead to manager"}
    
module.exports = promotionRouter;

