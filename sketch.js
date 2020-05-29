/*

k-NN visualizer
Companion to Color_Classifier.ino

*/

// Runs JS function on receiving the following Arduino input
let arduino   = new ArduinoEvents([
  {message:"Arduino k-NN color classifier", handler: reset},
  {message:"Enter an object name:",         handler: addCategory},
  {message:"Show me an example ",           handler: addExample},
  {message:"Let me guess your object",      handler: guessObject}
]);

// Run simulated Arduino input if there's a index.html?test parameter
if(window.location.href.indexOf("test") > -1){
  test(arduino.parser);
}

let k        = 10;
let examples = [];
let categories = [];
let countPerCategory = [];
let guess = null;

let size     = 20;
let minx     = 320;
let maxx     = minx+(9*size);
let miny     = 100;
let dot_x    = minx-size;
let dot_y    = miny;
let category = 0;
let banner   = "Connect to Arduino";

function reset() {
  examples = [];
  categories = [];
  countPerCategory = [];
  guess = null;
  dot_x    = minx-size;
  dot_y    = miny;
  banner = arduino.message;
}

function addCategory(a) {
}

function guessObject(red,green,blue) {
  guess = KNearestNeighbor([red,green,blue]);
}

function addExample(exampleCategory,red,green,blue){
  // Calculate position
  dot_x += size; // new dot
  if (dot_x > maxx) {dot_x = minx; dot_y += size;} // new row
  if (category != exampleCategory) {dot_x = minx; dot_y += size*3;
  category=exampleCategory; categories.push({name:exampleCategory,ypos:dot_y});// new category
  }

  examples.push({
    inputs: [red,green,blue],
    category: exampleCategory,

    x: dot_x,
    y: dot_y,
    nearest: false,
  })
}

function setup() {
  var canvas = createCanvas(800, 500);
  canvas.parent('p5-sketch');
  strokeWeight(2);
  textSize(24);
  textAlign(LEFT);
}

function draw() {
  background(0x88);

  categories.forEach(categoryLabel)

  examples.forEach(drawDot);

  // Draw banner
  if (arduino.message.indexOf(",")==-1) {banner = arduino.message;}
  noStroke();
  fill('#fff')
  textSize(48);
  text(banner, 50,50);

  function drawDot(example){
    // Normalize color for illustration
    var r = example.inputs[0];
    var g = example.inputs[1];
    var b = example.inputs[2];
    var f = 255/Math.max(r,g,b)

    if (example.nearest) {stroke("white");} else {stroke(color(r*f,g*f,b*f));}
    fill(color(r*f,g*f,b*f));
    ellipse(example.x,example.y,size-2,size-2);
  }

  function categoryLabel(cat){
    noStroke();
    for (let c = 0; c<categories.length; c++){
      textSize(80);
      if (guess == categories[c].name) {
        fill('#bbb')
        rect(minx-size,categories[c].ypos-size*2,size*17,size*5)
        fill('#fff');
      } else {
        fill('#bbb');
      }

      text(countPerCategory[c], maxx+size*2, categories[c].ypos+48);
      textSize(16);
      text(categories[c].name, minx-8, categories[c].ypos-22);
    }
  }
}

// Calculate KNN
// Just for vizualization purposes - Arduino is calculating the same on-device
function KNearestNeighbor(subject){

  function distance(a, b) {
    return Math.hypot(b[0]-a[0], b[1]-a[1], b[2]-a[2]);
  }
  var KNearest = [], max = 0, maxCategory = null

  // Sort examples by distance from subject
  var sorted = examples.sort(
    (a, b) =>   distance(a.inputs, subject)
              - distance(b.inputs, subject)
  );

  // Put the k nearest in the KNearest list
  for (let i = 0; i<sorted.length;i++){
    if (i < k) {
      sorted[i].nearest = true;
      KNearest.push(sorted[i]);
    } else {
      sorted[i].nearest = false;
    }
  }

  examples = sorted; // store back to global array

  // Count the number from each catgory in KNearest
  countPerCategory = [];
  categories.forEach(function(thisCategory) {
    var count = KNearest.filter(d => d.category === thisCategory.name).length;
    if (count > max) {
      maxCategory = thisCategory.name;
      max=count;}
      countPerCategory.push(count);
    })
    return maxCategory; // guess is category with the greatest number of closest examples
  }
