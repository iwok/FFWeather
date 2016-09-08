var express = require("express");
var app = require('express')();
var path    = require("path");
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Address4 = require('ip-address').Address4;
var request = require('then-request');
var jsonfile = require('jsonfile');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname + '/public')));

app.get('/', function(req, res){
   res.sendfile('index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});



//////////////////////////////////////////////

var sensors = [];
var sensordatatmp = [];

readSensordataJSON();


io.on('connection', function(socket, req, res){
console.log("client verbunden");
requestSensorData();
setTimeout(function () {
 //do something
 updateSensorValues();
}, 1000);

socket.emit('sensorlist', { sensorlist: sensors });

    socket.on('sensorinput', function(data, req){
      requestSensorData();
      //console.log(data);
          // User input sensor data
           // Prepare output in JSON format
           response =
             {
               "ipaddress":data.ipaddress,
               "latitude":data.latitude,
               "longitude":data.longitude,
               "temperature":"0",
               "humidity":"0",
               "pressure":"0"
             };

           sensors.push(response);
           //console.log("response: "+response);
           //writeSensordataJSON(sensors);
           //console.log("sensors: "+sensors);
           //res.end(JSON.stringify(response));
           // User Input sensordata END

        socket.emit('sensoradd', { sensoradd: sensors });
    });

    socket.on('disconnect', function () {
        io.emit('user disconnected');

        writeSensordataJSON(sensors);
      });


});



  // Check Sensors and Update their Data
  function updateSensorValues(){
      //  console.log("update sensor values");
      for (var i=0; i<sensors.length; i++) {

        var address = new Address4(sensors[i].ipaddress);

        if (address.isValid() == true &&
        address.startAddress().parsedAddress[0]==10 &&
        address.startAddress().parsedAddress[1]==34) {



      console.log("Sensordaten aktualisieren von "+sensors[i].ipaddress);
      console.log("sensordatatmp: "+sensordatatmp);
            sensors[i].temperature = sensordatatmp[i].temperature;
            sensors[i].humidity = sensordatatmp[i].humidity;
            sensors[i].pressure = sensordatatmp[i].pressure;

            writeSensordataJSON(sensors);


          //console.log("temperature: "+sensors[i].temperature);
          //console.log("humidity: "+sensors[i].humidity);
          //console.log("pressure: "+sensors[i].pressure);



    }else {
      sensors.splice(i,1);
      writeSensordataJSON(sensors);
      console.log("Sensor addresse invalide - ENTFERNT !!!");
    }

  }
  sensordatatmp = [];
}


  //
  function requestSensorData(){
    for (var i=0; i<sensors.length; i++) {

      var address = new Address4(sensors[i].ipaddress);

      if (address.isValid() == true &&
      address.startAddress().parsedAddress[0]==10 &&
      address.startAddress().parsedAddress[1]==34) {

        console.log("Sensordaten LADEN "+sensors[i].ipaddress);

        request('GET', 'http://'+sensors[i].ipaddress+'').done(function (res) {
        //console.log(res.body.toString());
          sensordatatmp.push(JSON.parse(res.body));
            //sensordatatmp.push(JSON.parse(res.body.toString()));
          //writeSensordataJSON(sensors);
            //console.log(sensordatatmp);
        });
      }
      else {
        sensors.splice(i,1);
        writeSensordataJSON(sensors);
        console.log("Sensor addresse invalide - ENTFERNT !!!");
      }
    }
  /*   request('GET', 'http://'+ipaddress+'').done(function (error, res) {

       console.log(res.body.toString());

       if (!error){
         //sensordatatmp = JSON.parse(body);
         //sensordatatmp.push(JSON.parse(response));
        // console.log("sensordatatmp request: "+JSON.stringify(sensordatatmp));
       }
       else{
         //console.log (response + ": " + error.toString ());
         //sensors.splice(i,1);

         //writeSensordataJSON(sensors);
         //console.log("Sensors: "+JSON.stringify(sensors));
         //console.log("Sensor Adresse down - ENTFERNT !!!");
       }

     });*/
}



  // Read Sensor Database from JSON file
  function readSensordataJSON(){
    var file = './database/sensors.json'

    sensors = jsonfile.readFileSync(file)
  }

  // Write Sensor Database to JSON file
  function writeSensordataJSON(sensordata){
    var file = './database/sensors.json'
    var obj = sensordata

    jsonfile.writeFileSync(file, obj, {spaces: 2})
    //console.log("write data to JSON "+obj);
  }

//------------------------------------------------------
