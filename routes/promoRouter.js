const express = require('express');
const mongoose = require('mongoose');
const bodyParser= require('body-Parser');
const Promotions = require('../models/promotions');


const promotionRouter = express.Router();

promotionRouter.use(bodyParser.json());

promotionRouter.route('/')
.get((req, res, next) => {
    Promotions.find({})
        .then((promotion) => {
            console.log(promotion);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);
        }, (err) => next(err))
        .catch((err) => next(err));
})
.post((req, res, next) => {
    Promotions.create(req.body)
        .then((promotion) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);
        }, (err) => next(err))
        .catch((err) => next(err));
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operations not supported on /Promotionss');
})
.delete((req, res, next) => {
    Promotions.remove({})
        .then((promotion) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);
        }, (err) => next(err))
        .catch((err) => next(err));
});
    
promotionRouter.route('/:promotionId')
.get((req, res, next) => {
    Promotions.findById(req.params.promotionId)
        .then((promotion) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);
        }), (err) => next((err))
            .catch((err) => next(err));
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /Promotionss/' + req.params.PromotionsId);
})
.put((req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.promotionId)
    .then((promotion)=> {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion);
    } , (err) => next(err))
    .catch(( err) => next(err));
     })
.delete((req, res, next) => {
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

