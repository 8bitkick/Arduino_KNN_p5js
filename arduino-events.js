
const serialMonitor = document.getElementById('serialMonitor');

class ArduinoEvents {
  constructor(lookup) {
    this.handler = null; // the next function we will call
    this.parameters = []; // stack for saved parameters
    this.lookup  = lookup;
    // Start Web Serial (Chrome only at this time)
    this.serial  = new WebSerial();
    this.parser = this.parser.bind(this);
    this.serial.setHandler(this.parser);
    this.message = "";
    this.dialog = document.getElementById('dialog');
    this.dialog.show();
  }

  parser(input){
        this.dialog.close();
    // remove trailing and leading whitespace
    let text = input.trim();

    serialMonitor.textContent += text + Array(40-text.length).join(" ")

    if (text=="") {return;}
    this.message = text;

    let func = null; // function to call based on the Arduino serial output we see
    let theseParameters = []; // parameters we only use this time around
    let lookup = this.lookup;

    // Check if the text matches any functions we expect.
    let n = 0;
    while (n < lookup.length && func == null) {
      let l = lookup[n];
      if (text.slice(0,l.message.length) == l.message) {
        func = l.handler;
        text = text.slice(l.message.length);
      }
      n++;
    }

    // anything we're left with is parameters
    if (text.length > 0){
      theseParameters = text.trim().split(',');
    }

    // if we've encountered a new function store it
    if (func != null) {
      this.handler = func;
      this.parameters = theseParameters; // parameters in-line with a function persist
    } else {
      // if no function, assume this line is parameters for the last function we saw
      theseParameters = this.parameters.concat(theseParameters);
    }

    // Parser is aware of how many parameters the function needs
    if (this.handler != null && theseParameters.length == this.handler.length){
      this.handler.apply(this,theseParameters); // call handler(theseParameters)
      serialMonitor.textContent += this.handler.name+"("+theseParameters.join(",")+")\n";
    } else {serialMonitor.textContent += "\n";}
  }
}


class WebSerial {
  constructor() {
    this.port  = null;
    this.handler = function (a) {console.log("Unhandled serial input: "+a)};
    // Set up the serial connect button
    this.button = document.getElementById('connectButton');
        this.button2 = document.getElementById('connectButton2');
    this.connect = this.connect.bind(this);
    document.addEventListener('DOMContentLoaded', () => {
      this.button.addEventListener('click', this.connect);
      if (!'serial' in navigator) {
        alert('Web Serial not supported by this browser. Try using Chrome')
      }
    });
    document.addEventListener('DOMContentLoaded', () => {
      this.button2.addEventListener('click', this.connect);
      if (!'serial' in navigator) {
        alert('Web Serial not supported by this browser. Try using Chrome')
      }
    });
  }

  async connect() {

    const requestOptions = {
      filters: [{ usbVendorId: 0x2341 }] // Filter on devices with the Arduino USB vendor ID.
    };

    this.port = await navigator.serial.requestPort(requestOptions);
    await this.port.open({ baudrate: 9600 });

    let decoder     = new TextDecoderStream();
    this.inputDone   = this.port.readable.pipeTo(decoder.writable);
    let inputStream  = decoder.readable;

    this.reader = inputStream.getReader();
    this.readLoop();
  }

  async disconnect() {
    if (reader) {
      await this.reader.cancel();
      await this.inputDone;
      this.reader = null;
      this.inputDone = null;
    }
    await this.port.close();
    this.port = null;
    button.style.backgroundColor="grey";
  }

  async readLoop() {
    let textBuffer = ""
    while (true) {
      const { value, done } = await this.reader.read();
      if (value) {
        textBuffer += value;
        let lines = textBuffer.split('\n');
        for (let l=0; l<lines.length-1;l++){
          this.handler(lines[l]);
        }
        textBuffer=lines.pop();
      }
      if (done) {
        this.reader.releaseLock();
        break;
      }
    }
  }

  setHandler(fn) {
    this.handler = fn;
  }
}


function test(func){
  let testInput = ["Show me an example apple","0.27,0.36,0.36","0.22,0.44,0.33","0.22,0.44,0.33","0.25,0.37,0.37","0.22,0.44,0.33","0.29,0.43,0.29","0.25,0.37,0.37","0.25,0.37,0.37","0.25,0.37,0.37","0.25,0.37,0.37","0.29,0.43,0.29","0.25,0.37,0.37","0.25,0.37,0.37","0.22,0.44,0.33","0.29,0.43,0.29","0.25,0.37,0.37","0.17,0.50,0.33","0.25,0.37,0.37","0.25,0.37,0.37","0.25,0.37,0.37","0.25,0.37,0.37","0.17,0.50,0.33","0.14,0.43,0.43","0.17,0.50,0.33","0.25,0.37,0.37","0.17,0.50,0.33","0.25,0.37,0.37","0.20,0.40,0.40","0.17,0.50,0.33","0.17,0.50,0.33","Show me an example orange","0.46,0.34,0.20","0.47,0.32,0.20","0.48,0.33,0.18","0.49,0.32,0.19","0.50,0.31,0.19","0.50,0.32,0.18","0.50,0.33,0.17","0.50,0.33,0.17","0.52,0.29,0.19","0.50,0.33,0.17","0.52,0.30,0.17","0.50,0.32,0.18","0.50,0.31,0.19","0.48,0.33,0.19","0.48,0.32,0.20","0.48,0.31,0.21","0.50,0.33,0.17","0.50,0.32,0.18","0.50,0.32,0.18","0.52,0.30,0.17","0.48,0.32,0.20","0.50,0.32,0.18","0.50,0.31,0.19","0.50,0.32,0.18","0.48,0.32,0.20","0.50,0.30,0.20","0.50,0.32,0.18","0.50,0.30,0.20","0.50,0.32,0.18","0.47,0.32,0.21","Show me an example peach","0.48,0.29,0.24","0.50,0.25,0.25","0.56,0.22,0.22","0.45,0.27,0.27","0.50,0.30,0.20","0.54,0.23,0.23","0.50,0.25,0.25","0.50,0.25,0.25","0.50,0.25,0.25","0.50,0.25,0.25","0.50,0.25,0.25","0.50,0.25,0.25","0.54,0.23,0.23","0.45,0.27,0.27","0.54,0.23,0.23","0.50,0.25,0.25","0.50,0.25,0.25","0.45,0.27,0.27","0.56,0.22,0.22","0.50,0.25,0.25","0.56,0.22,0.22","0.50,0.25,0.25","0.56,0.22,0.22","0.50,0.25,0.25","0.45,0.27,0.27","0.50,0.25,0.25","0.50,0.25,0.25","0.56,0.22,0.22","0.45,0.27,0.27","0.50,0.25,0.25","Let me guess your object","0.45,0.27,0.27","3","","","","","","","","","","","","","","","","","","","","","","","","","0.2,0.3,0.2","","","","","","","","","","","","","","","","","","","","","","","","","0.5,0.3,0.20"];
  //,0.17,0.50,0.33
  const delayLoop = (fn, delay) => {
    return (line, i) => {
      setTimeout(() => {
        func(line);
      }, i * 30);
    }
  };
  testInput.forEach(delayLoop(func, 30));
}
