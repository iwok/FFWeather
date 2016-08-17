/* 
   FFWeather - ESP8266 Webserver with a DHT and GY-63(MS5611) sensor as an input
   Based on ESP8266Webserver, DHTexample, BlinkWithoutDelay and DHTServer
   Version 1.0   3/08/2016   Iwo Koslowsky
*/

#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <Wire.h>
#include <MS5611.h>
#include <DHT.h>
#define DHTTYPE DHT11
#define DHTPIN  0 //PIN 3 on the NodeMCU

const char* ssid     = "ssid";
const char* password = "password";

ESP8266WebServer server(80);

DHT dht(DHTPIN, DHTTYPE, 11); // 11 works fine for ESP8266

long humidity, temp_c, pressure;  // Values read from sensor
String webString = "";   // String to display
// Generally, you should use "unsigned long" for variables that hold time
unsigned long previousMillis = 0;        // will store last temp was read
const long interval = 2000;              // interval at which to read sensor

MS5611 ms5611;
double referencePressure;

void handle_root() {
  // read sensor
  getSensors();

  server.send(200, "text/plain", "{\"sensor\":{\"temp\":\""+String((long)temp_c)+"\",\"humidity\":\""+String((long)humidity)+"\",\"pressure\":\""+String((long)pressure)+"\"}");
  delay(200);
}

void setup(void)
{
  // You can open the Arduino IDE Serial Monitor window to see what the code is doing
  Serial.begin(115200);  // Serial connection from ESP-01 via 3.3v console cable
  dht.begin();           // initialize temperature sensor

  // Initialize MS5611 sensor
  Serial.println("Initialize MS5611 Sensor");

  while (!ms5611.begin())
  {
    Serial.println("Could not find a valid MS5611 sensor, check wiring!");
    delay(500);
  }

  // Get reference pressure for relative altitude
  referencePressure = ms5611.readPressure();
  checkSettings();

  // Connect to WiFi network
  WiFi.begin(ssid, password);
  Serial.print("\n\r \n\rWorking to connect");

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("SunnESP Weather Reading Client");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  server.on("/", handle_root);

  server.begin();
  Serial.println("HTTP server started");
}

void loop(void)
{
  server.handleClient();
}

void getSensors() {
  // Wait at least 2 seconds seconds between measurements.
  // if the difference between the current time and last time you read
  // the sensor is bigger than the interval you set, read the sensor
  // Works better than delay for things happening elsewhere also
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    // save the last time you read the sensor
    previousMillis = currentMillis;

    // Reading temperature for humidity takes about 250 milliseconds!
    // Sensor readings may also be up to 2 seconds 'old' (it's a very slow sensor)
    humidity = dht.readHumidity();      // Read humidity (percent)
    temp_c = dht.readTemperature();     // Read temperature as Celsius
    pressure = ms5611.readPressure();   // Read pressure as Pascal

    Serial.println("Pressure: "+ ms5611.readPressure());
    // Check if any reads failed and exit early (to try again).
    if (isnan(humidity) || isnan(temp_c)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }
    if (isnan(pressure)) {
      Serial.println("Failed to read from Pressure sensor!");
      return;
    }
  }
}


void checkSettings()
{
  Serial.print("Oversampling: ");
  Serial.println(ms5611.getOversampling());
}

