'use strict';

const payments = require('./controllers/payments.js');

exports.route = function(event){
  return new Promise(function(resolve, reject) {
    let params = parse(event);
  //Routes are implemented here, and they are based on the resource in question
    switch(event.resource) {
      case "/paymentsApi/get/all":
        if (validateGetAll(params)){
          payments.getAll(params).then(function(items){
            resolve(items);
          });
        }
        break;
      case "/paymentsApi/get/{id}":
        if(validateID(event)){
          payments.get(params).then(function(item){
            console.log("calling get function from payments now");
            resolve(item);
          });
        }
        break;
      case "/paymentsApi/create":
        if (validateCreate(params) ){
          payments.create(params).then(function(item){
            resolve(item);
          });
        }
        break;
      case "/paymentsApi/update/{id}":
        if (validateID(event) ){
          payments.update(params).then(function(item){
            resolve(item);
          });
        }
        break;
      case "/paymentsApi/delete/{id}":
        if (validateID(event)){
          console.log("delete params are",params);
          payments.delete(params).then(function(item){
            resolve(item);
          });
        }
        break;
      default:
        return {};
    }
  });
}

//primitive validation functions for our event params, it must include an ID 
//if the method is GET/PUT/DELETE and must include contractId, value, time if method is POST
//except for get/all contractId, startDate, endDate are required

function validateID(event){
  if(event.pathParameters){
    if(numeric(event.pathParameters.id)){
      return true;
    }
  }
  return false;
}

function validateGetAll(params){
  if (numeric(params.contractId) && params.startDate && params.endDate){
    return true;
  }
  return false;
}

function validateCreate(params){
  if (numeric(params.contractId) && numeric(params.value) && params.time){
    return true;
  }
  return false;
}

//check if value is numeric or not
function numeric(n){
  return !isNaN(parseFloat(n));
}

//have a proper params ready for our controller
function parse(event){
  if (event.body !== null && event.body !== undefined) {
    let parsed = JSON.parse(event.body);
    if(event.pathParameters && event.pathParameters.id){
      parsed["id"] = parseInt(event.pathParameters.id);
    }
    console.log("parsed params", parsed);
    return parsed;
  }
  else if(event.pathParameters && event.pathParameters.id){
    return {id: parseInt(event.pathParameters.id)};
  }
  else {
    return {error: "body not parsable"};
  }
}
