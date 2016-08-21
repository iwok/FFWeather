var express = require('express');
var router = express.Router();

var http = require('http'); // added to get json data from sensors
var https = require("https");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'ffweather-server',
    temp: sensordata.temp,
    humidity: sensordata.humidity,
    pressure: sensordata.pressure
  });
});

  var options = {
    host: 'ip.jsontest.com',
    path: '/'
  };

  var sensordata = {
            temp: 23,
            humidity: 34,
            pressure: 5325
  };

  callback = function(response) {
    var str = '';

    //another chunk of data has been recieved, so update `str`
    response.on('data', function (chunk) {
      str = chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
      str = JSON.parse(str);
      console.log(str.ip);
      //sensordata = str;
    });
  }

  http.request(options, callback).end();

module.exports = router;
