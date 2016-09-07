var express = require("express");
var app = require('express')();
var path    = require("path");
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Address4 = require('ip-address').Address4;

app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname + '/public')));

app.get('/', function(req, res){
   res.sendfile('index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});



//////////////////////////////////////////////

var sensors = [
  {
    "ipadress": "0",
    "latitude": "0",
    "longitude": "0",
    "temperature": "0",
    "humidity": "0",
    "pressure": "0"
  }
];
var sensordatatmp = {
    "temperature": "0",
    "humidity": "0",
    "pressure": "0"
};
var mapSensors = {};

io.on('connection', function(socket, req, res){
console.log("client verbunden");
readSensordataJSON();
updateSensorValues();

socket.emit('sensorlist', { sensorlist: sensors });

    socket.on('sensorinput', function(data, req){
      //console.log(data);
          // User input sensor data
           // Prepare output in JSON format
           response =
             {
               "ipadress":data.ipadress,
               "latitude":data.latitude,
               "longitude":data.longitude,
               "temperature":"0",
               "humidity":"0",
               "pressure":"0"
             };

           sensors.push(response);
           //console.log("response: "+response);
           writeSensordataJSON(sensors);
           //console.log("sensors: "+sensors);
           //res.end(JSON.stringify(response));
           // User Input sensordata END

        socket.emit('sensoradd', { sensorlist: sensors });
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




          if (address.isValid() == true &&
          address.startAddress().parsedAddress[0]==10 &&
          address.startAddress().parsedAddress[1]==34) {

            //sensors[i].temperature = "0";
            //sensors[i].humidity = "0";
            //sensors[i].pressure = "0";

          /*  session.pingHost (sensors[i].ipadress, function (error, target) {
              console.log (target + " pingin");
              if (error)
                if (error instanceof ping.RequestTimedOutError)
                console.log (target + ": Not alive");
              else
                console.log (target + ": " + error.toString ());
              else
                console.log (target + ": Alive");
              });*/

              //console.log (sensors[i].ipadress + " pingin");





                       request("http://"+sensors[i].ipadress+"", function (error, response, body) {

                         if (!error){
                           sensordatatmp = JSON.parse(body);

                           //console.log("sensordatatmp: "+sensordatatmp.ipadress);
                         }
                         else{
                           console.log (response + ": " + error.toString ());
                           sensorOK = false;
                           console.log("Sensors: "+sensors);
                           sensors.splice(i,1);

                           writeSensordataJSON(sensors);
                           console.log("Sensors: "+sensors);
                           console.log("Sensor Adresse down - ENTFERNT !!!");
                         }
                       });


                       sensors[i].temperature = sensordatatmp.temperature;
                       sensors[i].humidity = sensordatatmp.humidity;
                       sensors[i].pressure = sensordatatmp.pressure;


                       writeSensordataJSON(sensors);

                       console.log("temperature: "+sensors[i].temperature);
                       console.log("humidity: "+sensors[i].humidity);
                       console.log("pressure: "+sensors[i].pressure);



          }
          else {
            sensors.splice(i,1);
            writeSensordataJSON(sensors);
            console.log("Sensor Adresse invalid - ENTFERNT !!!");
          }






  // Read Sensor Database from JSON file
  function readSensordataJSON(){

    var jsonfile = require('jsonfile')
    var file = './database/sensors.json'

    sensors = jsonfile.readFileSync(file)
  }

  // Write Sensor Database to JSON file
  function writeSensordataJSON(sensordata){

    var jsonfile = require('jsonfile')

    var file = './database/sensors.json'
    var obj = sensordata

    jsonfile.writeFileSync(file, obj, {spaces: 2})
    //console.log("write data to JSON "+obj);
  }

//------------------------------------------------------
