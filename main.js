'use strict';

const routes = require('./routes.js');

exports.handler = async function(event, context,callback){
  //routing event to its right direction (controller) 
  //using a promise so we return results before leaving the request
  return routes.route(event)
  .then(function(items){
    return response(items);
  });
};

//helper methods

// build response function for 200 results
function response(obj){
  let res = {
    statusCode: 200,
    body: JSON.stringify(obj),
  };
  return res;
}
