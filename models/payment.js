'use strict';

//payments.js
//a model scheme for our payments documents
const db = require('./db.js');
const table = "payments";

// create a payment document
exports.create = function(params){
  return new Promise(function(resolve, reject) {
    db.genId(table).then(function(id){
      console.log("we got an ID now", id);
      var createParams = {
        TableName: table,
        Item:{
          "id": id,
          "contractId": params.contractId,
          "description": params.description,
          "value": params.value,
          "time": params.time || db.dateTimeISO(),
          "createdAt": db.dateTimeISO(),
          "updatedAt": db.dateTimeISO(),
          "isImported": false,
          "isDeleted": false
        },
        ReturnValues: "ALL_OLD"
      };
      db.create(createParams).then(function(item){
        resolve(item);
      });
    });
  });
}

// update a payment document
exports.update = function(params){
  return new Promise(function(resolve, reject) {
    console.log("attributesToUpdate(params)",attributesToUpdate(params));
    let attrs = attributesToUpdate(params);
    var updateParams = {
      TableName:table,
      Key:{
        "id": params.id,
      },
      UpdateExpression: `set ${attrs[0]}`,
      ExpressionAttributeValues: attrs[1],
      ExpressionAttributeNames: attrs[2],
      ReturnValues:"ALL_NEW"
    };
    db.update(updateParams).then(function(item){
      resolve(item);
    });
  });
}

//find a payment
exports.findOne = function(params){
  return new Promise(function(resolve, reject) {
    var findParams = {
      TableName:table,
      ExpressionAttributeValues: {
        ":id": params.id,
        ":false": false
      },
      KeyConditionExpression: 'id = :id',
      FilterExpression: 'isDeleted = :false'
    };
    db.query(findParams).then(function(items){
      resolve(items[0]);
    });
  });
}
//find all payments with specific criteria
//TODO using expressionAttributeNames
exports.findAll = function(params){
  return new Promise(function(resolve, reject) {
    var findAllParams = {
      TableName: table,
      IndexName: "contractId-time-index",
      ExpressionAttributeValues: {
        ":startDate": params.startDate,
        ":endDate": params.endDate,
        ":contractId" : params.contractId,
        ":false" : false,
      },
      ExpressionAttributeNames: {
        "#time": "time"
      },
      KeyConditionExpression: "contractId = :contractId and #time BETWEEN :startDate AND :endDate",
      FilterExpression: 'isDeleted = :false'
    };
    db.query(findAllParams).then(function(items){
      console.log("inside then waiting for items", items);
      resolve(items);
    });
  });
}

//mark a document as deleted
exports.delete = function(params){
  return new Promise(function(resolve, reject) {
    var deleteParams = {
      TableName:table,
      Key:{
        "id": params.id,
      },
      ExpressionAttributeValues: {
        ":true": true,
        ":date": db.dateTimeISO()
      },
      UpdateExpression: "set isDeleted = :true, updatedAt = :date",
      ReturnValues:"ALL_NEW"
    };
    db.update(deleteParams).then(function(item){
      resolve(item);
    })
  });
}

//a helper function to set attributes that are requested to be updated
//we can add more params to be updated from here
function attributesToUpdate(params){
  var statement = [];
  var expValues = {};
  var expNames = {};

  if (params.description){
    statement.push(" #desc = :desc ");
    expValues[":desc"] = params.description;
    expNames["#desc"] = "description";
  }
  if (params.value){
    statement.push(" #value = :value ");
    expValues[":value"] = params.value;
    expNames["#value"] = "value";
  }
  if (params.time){
    statement.push(" #time = :time ");
    expValues[":time"] = params.time;
    expNames["#time"] = "time";
  }
  //updatedAt update
  statement.push(" #updatedAt = :updatedAt ");
  expValues[":updatedAt"] = db.dateTimeISO();
  expNames["#updatedAt"] = "updatedAt";

  return [statement.join(","), expValues, expNames];
}
