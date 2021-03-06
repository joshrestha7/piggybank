/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/




var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const plaid = require('plaid')

//create a Plaid client
const plaidClient = new plaid.Client({
  clientID: process.env.PLAID_CLIENT_ID,
  secret: process.env.PLAID_SECRET,
  env: plaid.environments.sandbox
});

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

app.post('/create-link-token', function(req, res) {
  if ('id' in req.body) {
    let id = req.body['id'];
    
    let params = {
      user: {
        client_user_id: id
      },
      client_name: 'PiggyBank',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en'
    };
    plaidClient.createLinkToken(params, (err, response) => {
      if(err) {
        res.statusCode = 500;
        res.json({error: err});
      } else{
        res.json({success: 'link token created!', linkToken: response.link_token})
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
