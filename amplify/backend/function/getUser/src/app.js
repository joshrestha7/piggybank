/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/



const AWS = require('aws-sdk')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var bodyParser = require('body-parser')
var express = require('express')

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = "userdb";

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

app.post("/get-user/id/email", function(req, res) {
  if ('id' in req.body && 'email' in req.body) {
    let idValue = req.body['id'];
    let emailValue = req.body['email'];
    let getItemParams = {
      TableName: tableName,
      Key: {
        id: idValue,
        email: emailValue
      }
    }
      
    dynamodb.get(getItemParams,(err, data) => {
      if(err) {
        res.statusCode = 500;
        res.json({error: 'Could not get user: ' + err.message});
      } else {
        if (data.Item) {
          res.json(data.Item);
        } else {
          res.json(data);
        }
      }
    });
  } else {
    res.statusCode = 500;
    res.json({error: 'id is required'});
  }
});


app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app