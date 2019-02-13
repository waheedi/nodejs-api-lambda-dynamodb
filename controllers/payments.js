'use strict';

const payment = require('../models/payment.js');

exports.get = function(params){
  return new Promise(function(resolve, reject) {
    payment.findOne(params).then(function(items){
      console.log(items);
      resolve(items);
    });
  });
}

exports.getAll = function(params){
  return new Promise(function(resolve, reject) {
    payment.findAll(params).then(function(items){
      console.log(items);
      let sum = items.map(a => a.value).reduce((a, b) => a + b, 0);
      resolve({"sum": sum, "items": items});
    });
  });
}

exports.create = function(params){
  return new Promise(function(resolve, reject) {
    payment.create(params).then(function(item){
     resolve(item);
    });
  });
}

exports.update = function(params){
  return new Promise(function(resolve, reject) {
    payment.update(params).then(function(item){
      resolve(item);
    });
  });
}

exports.delete = function(params){
  return new Promise(function(resolve, reject) {
    payment.delete(params).then(function(item){
      resolve(item);
    });
  });
}
