# Arduino_KNN_p5js
Companion web visualization for the Arduino_KNN [ColorClassifier.ino](https://github.com/arduino-libraries/Arduino_KNN/tree/master/examples/ColorClassifier) sketch

The p5.js sketch is designed to connect to [Arduino Nano BLE sense](https://store.arduino.cc/usa/nano-33-ble-sense) and visualize the function of the machine learning algorithm running on the arduino board. I made this to create diagrams and videos to explain the function of KNN.

  The Arduinio sketch learns from examples then classifies objects using a color sensor. [Full write up here](https://blog.arduino.cc/2020/06/18/simple-machine-learning-with-arduino-knn/). 


## Usage 

  Program your board with the [ColorClassifier sketch](https://blog.arduino.cc/2020/06/18/simple-machine-learning-with-arduino-knn/). 

  Load index.html. The sketch currently relies on Web Serial so is Chrome only at this time.

  Teach the Arduino by putting an example of each object close to the color sensor.
  
  After this the Arduino will guess the name of objects it is shown based on how similar
  the color is to the examples it has seen using the k-NN algorithm. 
  
  ![Image description](https://github.com/8bitkick/Arduino_KNN_p5js/raw/master/images/screenshot.gif)


  
## Test without Arduino Board

You can load the p5js sketch with test input by using the ?test URL parameter

 `index.html?test`


## Background: How Arduino serial triggers p5.js functions 

This example includes is a simple RPC library that enables Arduino sketch serial input to trigger a javascript function call, allowing easy creation of javascript or p5.js web apps or visualizations for Arduino sketches while allowing the Arduino sketch output to remain human readable and usable with or without the web companion.

### Set up event handlers 
It is trivial to instance the library and associate serial messages with javascript functions to call.
~~~ 
let arduino  = new ArduinoEvents([
  {message:"Arduino perceptron",                       handler: reset},
  {message:"Show me ",                                 handler: addExample},
  {message:"Start weights:",                           handler: setWeights}
]);
 ~~~ 

### Connect to Arduino using web serial (chrome only)

The user presses a button on the webpage to open the chrome serial dialog in order to start a serial connection to the Arduino board.

### Arduino Serial output now triggers JavaScript functions

On seeing a known `message` at the beginning of any line of serial input, the corresponding javascript `handler` function will be called. The handler can be any javascript function with no special consideration required.

### Parameters

The parser takes all text after the matched `message` to be comma seperated parameters. This behaves pretty much how you'd expect it. 

The Arduino serial message:

~~~ 
Start weights: 0.27,0.36,0.36
~~~ 

Will automatically result in the javascript function call:

`setWeights(0.27,0.36,0.36)`

The parser is aware of the number of parameters any given javascript function requires. If you don't pass all parameters with the message, the function will not be called immediately - but the parameters you do pass are treated as 'sticky' until the next `message` is matched.

For example the function addExampe takes 4 parameters and so:

~~~ 
Show me an orange       (no function called yet, but "an orange" is sticky as the first parameter)

0.22,0.44,0.33          addExample("an orange",0.22,0.44,0.33) is called 

0.22,0.55,0.44          addExample("an orange",0.22,0.55,0.44) is called
~~~ 


## Security
Web Serial requires the user to initiate a serial connection with the device via a dialog box in the browser. Once you do this those serial messages are able to control your javascript application by triggering handler functions and possibly more. Therefore it is recommended to only connect to devices you control. This library is intended for demonstrations, prototyping and proofs of concept.  
