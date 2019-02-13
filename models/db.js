'use strict';

//This is where we will have all our database logic, for this case we will be using dynamoDB

const aws = require("aws-sdk");

//set the region and the end-point for dynamoDb, can be updated to be more dynamic, 
//but for the sake of this task we are making it static

aws.config.update({
  region: "eu-central-1",
  endpoint: "https://dynamodb.eu-central-1.amazonaws.com"
});

const docClient = new aws.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

//create function to be used from other models
exports.create = function(params){
  return new Promise(function(resolve, reject) {
    docClient.put(params, function(err, data) {
      if (err) {
        console.error(`${params.TableName}: Unable to add new item. Error JSON:`, JSON.stringify(err, null, 2));
      }
      else {
        console.log(`${params.TableName}: item Created`);
        resolve(params.Item);
      }
    });
  });
}

//update our document with new params
exports.update = function(params){
  return new Promise(function(resolve, reject) {
    docClient.update(params, function(err, data) {
      if (err) {
        console.error(`${params.TableName}: Unable to update item. Error JSON:`, JSON.stringify(err, null, 2));
      }
      else {
        console.log(`${params.TableName}: UpdateItem succeeded `, JSON.stringify(data, null, 2));
        resolve(data.Attributes);
      }
    });
  });
}

//delete function in this case will not be used, instead update method will be used
exports.delete = function(table){
  //Not needed now
}

//query function

exports.query = function(params){
  return new Promise(function(resolve, reject) {
    docClient.query(params, function(err, data) {
      if (err) {
        console.error(`${params.TableName}: Error while querying `, JSON.stringify(err, null, 2));
      }
      else {
        console.log(`${params.TableName}: Success`, JSON.stringify(data, null, 2));
        resolve(data.Items);
      }
    });
  });
}

//Helper functions

//Generate ID based on the last item (ID + 1) for a specific table

exports.genId = function(table){
  return new Promise(function(resolve, reject) {
    var paramsIncrement = {
      TableName:"ids",
      Key:{
          "table_name": table
      },
      UpdateExpression: "set id = if_not_exists(id, :zero) + :val ",
      ExpressionAttributeValues:{
          ":val": 1,
          ":zero": 0
      },
      ReturnValues:"UPDATED_NEW"
    };
    var idParams = {
      TableName:"ids",
      ProjectionExpression: "id",
      ExpressionAttributeValues: {
        ":table_name": table
      },
      KeyConditionExpression: "table_name = :table_name",
      Limit: 1
    };
    docClient.query(idParams, function(err, data) {
      if (err) {
        console.log(`${table}: Error querying `, JSON.stringify(err, null, 2));
      }
      else {
        console.log(`${table}: Success`, data);
        docClient.update(paramsIncrement, function(err, data) {
          if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
          }
          else {
            console.log("New ID succeeded:", JSON.stringify(data.Attributes.id, null, 2));
            resolve(data.Attributes.id);
          }
        });
      }
    });
  });
}

//Generate ISO time string
exports.dateTimeISO = function(){
  var d = new Date;
  return d.toISOString();
}
