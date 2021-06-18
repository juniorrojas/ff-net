(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class Color {
  // r, g, b, a are numbers between 0 and 1
  constructor(r, g, b, a) {
    if (a == null) a = 1;
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  
  blend(c, t) {
    if (Math.abs(t) > 1) throw new Error("t must be a number between -1 and 1");
    
    let source, target;
    if (t >= 0) {
      source = this;
      target = c;
    } else {
      source = c;
      target = this;
    }
    
    return new Color(
      source.r * (1 - t) + target.r * t,
      source.g * (1 - t) + target.g * t,
      source.b * (1 - t) + target.b * t
    );
  }

  toString() {
    const r = Math.floor(255 * this.r);
    const g = Math.floor(255 * this.g);
    const b = Math.floor(255 * this.b);
    const a = this.a;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
}

Color.white = new Color(1, 1, 1);
Color.black = new Color(0, 0, 0);

Color.red = new Color(226 / 255, 86 / 255, 86 / 255);
Color.blue = new Color(135 / 255, 173 / 255, 236 / 255);

Color.lightBlue = new Color(186 / 255, 224 / 255, 251 / 255);
Color.lightRed = new Color(252 / 255, 163 / 255, 163 / 255);

module.exports = Color;
},{}],2:[function(require,module,exports){
const svg = {};

svg.createElement = function(element) {
  return document.createElementNS("http://www.w3.org/2000/svg", element);
}

module.exports = svg;

},{}],3:[function(require,module,exports){
module.exports={"dataPoints":[{"x":0.08,"y":0.24,"label":1},{"x":0.2,"y":0.27,"label":1},{"x":0.05,"y":0.3,"label":1},{"x":0.1,"y":0.1,"label":1},{"x":0.4,"y":0.4,"label":0},{"x":0.6,"y":0.4,"label":0},{"x":0.65,"y":0.7,"label":0},{"x":0.7,"y":0.3,"label":0},{"x":0.35,"y":0.65,"label":0},{"x":0.3,"y":0.5,"label":0},{"x":0.7,"y":0.5,"label":0},{"x":0.75,"y":0.55,"label":0},{"x":0.7,"y":0.6,"label":0},{"x":0.65,"y":0.34,"label":0},{"x":0.8,"y":0.65,"label":0},{"x":0.5,"y":0.7,"label":0},{"x":0.5,"y":0.66,"label":0},{"x":0.56,"y":0.66,"label":0},{"x":0.46,"y":0.36,"label":0},{"x":0.46,"y":0.26,"label":0},{"x":0.36,"y":0.26,"label":0},{"x":0.26,"y":0.36,"label":0},{"x":0.56,"y":0.28,"label":0},{"x":0.33,"y":0.54,"label":0},{"x":0.23,"y":0.52,"label":0},{"x":0.26,"y":0.16,"label":1},{"x":0.06,"y":0.46,"label":1},{"x":0.13,"y":0.66,"label":1},{"x":0.2,"y":0.8,"label":1},{"x":0.5,"y":0.5,"label":1},{"x":0.45,"y":0.5,"label":1},{"x":0.5,"y":0.45,"label":1},{"x":0.45,"y":0.45,"label":1},{"x":0.55,"y":0.55,"label":1},{"x":0.5,"y":0.55,"label":1},{"x":0.5,"y":0.2,"label":1},{"x":0.4,"y":0.1,"label":1},{"x":0.6,"y":0.1,"label":1},{"x":0.75,"y":0.15,"label":1},{"x":0.88,"y":0.22,"label":1},{"x":0.9,"y":0.35,"label":1},{"x":0.9,"y":0.49,"label":1},{"x":0.88,"y":0.62,"label":1},{"x":0.9,"y":0.9,"label":1},{"x":0.9,"y":0.8,"label":1},{"x":0.75,"y":0.85,"label":1},{"x":0.55,"y":0.92,"label":1},{"x":0.6,"y":0.95,"label":1},{"x":0.06,"y":0.57,"label":1},{"x":0.09,"y":0.8,"label":1},{"x":0.4,"y":0.9,"label":1}],"model":{"layers":[{"neurons":[{"bias":0.5},{"bias":0.5}]},{"neurons":[{"bias":0.5},{"bias":0.5},{"bias":0.5},{"bias":0.5},{"bias":0.5}]},{"neurons":[{"bias":0.5},{"bias":0.5},{"bias":0.5},{"bias":0.5},{"bias":0.5}]},{"neurons":[{"bias":0.5},{"bias":0.5}]},{"neurons":[{"bias":0.5}]}],"links":[{"n0":[0,0],"nf":[1,0],"weight":2.2559318523672673},{"n0":[0,0],"nf":[1,1],"weight":3.7705902078344162},{"n0":[0,0],"nf":[1,2],"weight":-5.673868837964195},{"n0":[0,0],"nf":[1,3],"weight":-2.552116396138559},{"n0":[0,0],"nf":[1,4],"weight":-4.765897189158554},{"n0":[0,1],"nf":[1,0],"weight":2.522847383501193},{"n0":[0,1],"nf":[1,1],"weight":-2.9902303588384505},{"n0":[0,1],"nf":[1,2],"weight":2.749623598598969},{"n0":[0,1],"nf":[1,3],"weight":-2.0657459601688077},{"n0":[0,1],"nf":[1,4],"weight":2.311040191441733},{"n0":[1,0],"nf":[2,0],"weight":-2.8083933750840506},{"n0":[1,0],"nf":[2,1],"weight":2.368208438212055},{"n0":[1,0],"nf":[2,2],"weight":2.792010178964303},{"n0":[1,0],"nf":[2,3],"weight":2.1204797088106764},{"n0":[1,0],"nf":[2,4],"weight":3.0855603411983634},{"n0":[1,1],"nf":[2,0],"weight":-2.1619760012233913},{"n0":[1,1],"nf":[2,1],"weight":2.7735676578848043},{"n0":[1,1],"nf":[2,2],"weight":-4.795321974592097},{"n0":[1,1],"nf":[2,3],"weight":-3.1618858651724424},{"n0":[1,1],"nf":[2,4],"weight":2.642537468325151},{"n0":[1,2],"nf":[2,0],"weight":5.111269168104936},{"n0":[1,2],"nf":[2,1],"weight":1.8060793114773712},{"n0":[1,2],"nf":[2,2],"weight":1.2874475479043777},{"n0":[1,2],"nf":[2,3],"weight":3.715659708889894},{"n0":[1,2],"nf":[2,4],"weight":-5.479057778095251},{"n0":[1,3],"nf":[2,0],"weight":4.279970838297447},{"n0":[1,3],"nf":[2,1],"weight":-3.8573191202934085},{"n0":[1,3],"nf":[2,2],"weight":-4.346636276004062},{"n0":[1,3],"nf":[2,3],"weight":1.8026421918582567},{"n0":[1,3],"nf":[2,4],"weight":3.9687935202147346},{"n0":[1,4],"nf":[2,0],"weight":-3.5216391228147197},{"n0":[1,4],"nf":[2,1],"weight":4.599458665307638},{"n0":[1,4],"nf":[2,2],"weight":-4.752572287153145},{"n0":[1,4],"nf":[2,3],"weight":-3.810827524569661},{"n0":[1,4],"nf":[2,4],"weight":3.0650028924296953},{"n0":[2,0],"nf":[3,0],"weight":-4.300364295192499},{"n0":[2,0],"nf":[3,1],"weight":-2.9036061692080217},{"n0":[2,1],"nf":[3,0],"weight":4.132576329093505},{"n0":[2,1],"nf":[3,1],"weight":-3.817976850598705},{"n0":[2,2],"nf":[3,0],"weight":4.606542085589321},{"n0":[2,2],"nf":[3,1],"weight":2.8220313920923323},{"n0":[2,3],"nf":[3,0],"weight":2.3423002019828885},{"n0":[2,3],"nf":[3,1],"weight":2.098573708791525},{"n0":[2,4],"nf":[3,0],"weight":4.4760505444141625},{"n0":[2,4],"nf":[3,1],"weight":3.95752484391276},{"n0":[3,0],"nf":[4,0],"weight":-0.7265226578414495},{"n0":[3,1],"nf":[4,0],"weight":-4.316679309853457}]}}
},{}],4:[function(require,module,exports){
const nn = require("./nn");
const ui = require("./ui");
const svg = require("./common/svg");

class App {
  constructor(data) {    
    const container = document.createElement("div");
    container.className = "content-container";
    this.domElement = container;
    
    let row;
    
    row = document.createElement("div");
    container.appendChild(row);
    row.className = "content-container-row";
    
    let svgModel = svg.createElement("svg");
    svgModel.class = "content-container-cell";
    svgModel.id = "neural-net";
    row.appendChild(svgModel);
    
    const model = this.model = nn.Sequential.fromData(data.model);
    svgModel.appendChild(model.svgElement);
    
    const dataCanvas = this.dataCanvas = ui.DataCanvas.fromData(data.dataPoints);
    dataCanvas.domElement.className += " content-container-cell";
    dataCanvas.domElement.id = "data-canvas";
    row.appendChild(dataCanvas.domElement);
    
    row = document.createElement("div");
    container.appendChild(row);
    row.className = "content-container-row";
    
    const controlPanel = this.controlPanel = new ui.ControlPanel({
      app: this,
      neuralNet: model
    });
    controlPanel.domElement.className += " content-container-cell";
    row.appendChild(controlPanel.domElement);
    
    this.update();
  }

  update() {
    const model = this.model;
    const dataCanvas = this.dataCanvas;
    const trainOutput = model.train({
      learningRate: this.controlPanel.learningRate,
      regularization: this.controlPanel.regularization,
      iters: 10,
      dataCanvas: dataCanvas
    });

    const dataLoss = trainOutput.dataLoss;
    const regularizationLoss = trainOutput.regularizationLoss;
    
    model.render();
    dataCanvas.render((x, y) => {
      model.layers[0].neurons[0].activation = x;
      model.layers[0].neurons[1].activation = y;
      model.forward();
      return model.layers[model.layers.length - 1].neurons[0].activation;
    });
    this.controlPanel.update({
      totalLoss: dataLoss + regularizationLoss,
      dataLoss: dataLoss,
      regularizationLoss: regularizationLoss
    });

    requestAnimationFrame(() => {
      this.update();
    });
  }

  toData() {
    return {
      dataPoints: this.dataCanvas.toData(),
      model: this.model.toData()
    }
  }
}

ui.init(() => {
  const divTitle = document.createElement("div");
  document.body.appendChild(divTitle);
  divTitle.className = "title-container";
  divTitle.textContent = "";

  const h1 = document.createElement("h1");
  h1.textContent = "ff-net";
  divTitle.appendChild(h1);

  const h2 = document.createElement("h2");
  h2.textContent = "feedforward neural network learning in real time";
  divTitle.appendChild(h2);

  const data = require("./data");
  const app = new App(data);
  document.body.appendChild(app.domElement);
  window.app = app;
});
},{"./common/svg":2,"./data":3,"./nn":9,"./ui":15}],5:[function(require,module,exports){
const Neuron = require("./Neuron");

class Layer {
  constructor(parent) {
    this.parent = parent;
    this.neurons = [];
  }

  render() {
    this.neurons.forEach((neuron) => {
      neuron.render();
    });
  }

  reset() {
    for (let i = 0; i < this.neurons.length; i++) {
      const neuron = this.neurons[i];
      neuron.reset();
    }
  }

  addNeuron(bias) {
    if (bias == null) bias = 0.5;
    const neuron = new Neuron(this, bias);
    this.neurons.push(neuron);
    this.parent.neurons.push(neuron);
    this.parent.svgNeurons.appendChild(neuron.svgElement);
    return neuron;
  }

  getNeuronAt(i) {
    return this.neurons[i];
  }

  getNeuronCount() {
    return this.neurons.length;
  }

  getIndex() {
    return this.parent.layers.indexOf(this);
  }

  toData() {
    const data = {
      neurons: this.neurons.map((neuron) => neuron.toData())
    };
    return data;
  }

  static fromData(neuralNet, data) {
    const layer = neuralNet.addLayer();
    data.neurons.forEach((neuronData) => {
      Neuron.fromData(layer, neuronData);
    });
  }
}

module.exports = Layer;

},{"./Neuron":7}],6:[function(require,module,exports){
const svg = require("../common/svg");
const Color = require("../common/Color");

class Link {
  constructor(neuralNet, n0, nf, weight) {
    this.neuralNet = neuralNet;
    this.n0 = n0;
    this.nf = nf;
    
    if (this.n0.layer.getIndex() + 1 != this.nf.layer.getIndex()) {
      throw "Cannot connect neurons from non-consecutive layers";
    }
    
    if (weight == null) this.weight = 1;
    else this.weight = weight;
    this.dWeight = 0;

    this.svgElement = svg.createElement("path");
    this.render();
  }

  render() {
    const path = this.svgElement;
    const p0 = this.n0.getPosition();
    const pf = this.nf.getPosition();
    path.setAttribute(
      "d",
      "M" + p0.x + " " + p0.y + " " +
      "L" + pf.x + " " + pf.y
    );
    const maxVisibleWeight = 5;
    const width = 9 * Math.min(1, Math.abs(this.weight) / maxVisibleWeight);
    path.setAttribute("stroke-width", width);
    let color;
    if (this.weight < 0) color = Color.red;
    else color = Color.blue;
    path.setAttribute("stroke-opacity", 0.4);
    path.setAttribute("stroke", color);
  }

  backward(regularization) {
    let regularizationError = 0;
    this.dWeight = this.n0.activation * this.nf.dPreActivation;
    // regularization error = 0.5 * regularization * weight^2
    this.dWeight += regularization * this.weight;
    regularizationError += 0.5 * regularization * this.weight * this.weight;
    return regularizationError;
  }

  applyGradient(learningRate) {
    this.weight -= learningRate * this.dWeight;
  }

  toData() {
    const data = {};
    data.n0 = [
      this.n0.layer.getIndex(),
      this.n0.getIndex()
    ];
    data.nf = [
      this.nf.layer.getIndex(),
      this.nf.getIndex()
    ];
    data.weight = this.weight;
    return data;
  }

  static fromData(neuralNet, data) {
    const weight = data.weight;
    const a = data.n0;
    const b = data.nf;
    const n0 = neuralNet.layers[a[0]].neurons[a[1]];
    const nf = neuralNet.layers[b[0]].neurons[b[1]];
    const link = neuralNet.addLink(n0, nf, weight);
    return link;
  }
}

module.exports = Link;

},{"../common/Color":1,"../common/svg":2}],7:[function(require,module,exports){
const svg = require("../common/svg");
const Color = require("../common/Color");

const radius = 12;
const strokeWidth = 2;

function sigmoid(n) {
  return 1 / (1 + Math.exp(-n));
}

function dSigmoid(n) {
  return sigmoid(n) * (1 - sigmoid(n));
}

class Neuron {
  constructor(layer, bias) {
    this.layer = layer;
    this.links = [];
    this.backLinks = [];

    this.bias = bias;
    this.preActivation = 0;
    this.activation = sigmoid(this.bias);

    this.dActivation = 0;
    this.dPreActivation = 0;
    this.dBias = 0;

    const svgElement = this.svgElement = svg.createElement("circle");
    svgElement.setAttribute("r", radius);
  }

  forward() {
    this.preActivation = 0;
    this.preActivation += this.bias;
    this.backLinks.forEach((link) => {
      this.preActivation += link.weight * link.n0.activation;
    });
    this.activation = sigmoid(this.preActivation);
  }

  backward(regularization) {
    let regularizationError = 0;

    this.links.forEach((link) => {
      this.dActivation += link.weight * link.dWeight;
    });
    
    this.dPreActivation = this.dActivation * dSigmoid(this.preActivation);
    this.dBias = this.dPreActivation;
    
    this.backLinks.forEach((link) => {
      regularizationError += link.backward(regularization);
    });
    
    return regularizationError;
  }

  applyGradient(learningRate) {
    this.bias -= learningRate * this.dBias;
  }

  render() {
    const circle = this.svgElement;
    const position = this.getPosition();
    circle.setAttribute("cx", position.x);
    circle.setAttribute("cy", position.y);

    const isInput = this.backLinks.length == 0;
    let fillColor;
    if (isInput) {
      fillColor = Color.blue.blend(Color.red, 0.6);
    } else {
      const maxVisibleAbsBias = 3;
      let visibleBias = Math.max(Math.min(this.bias, maxVisibleAbsBias), -maxVisibleAbsBias);
      const t = 0.5  + visibleBias / maxVisibleAbsBias * 0.5;
      fillColor = Color.red.blend(Color.blue, t);
    }

    const strokeColor = fillColor.blend(Color.black, 0.3);
    
    circle.setAttribute("fill", fillColor.toString());
    circle.setAttribute("stroke", strokeColor.toString());
    circle.setAttribute("stroke-width", strokeWidth);
  }

  getIndex() {
    return this.layer.neurons.indexOf(this);
  }

  getPosition() {
    const neuralNet = this.layer.parent;
    const neuronCount = this.layer.neurons.length;
    const layerCount = neuralNet.layers.length;
    const maxNeuronCountPerLayer = 5;
    
    const container = neuralNet.svgElement.parentNode;
    if (container == null) return {x: 0, y: 0};
    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;
    
    const cy = height / 2;
    const cx = width / 2;
    
    const dx = (width - (radius + strokeWidth) * 2) / (layerCount - 1);
    const dy = (height - (radius + strokeWidth) * 2) / (maxNeuronCountPerLayer - 1);
    
    const x = cx + (this.layer.getIndex() - (layerCount - 1) / 2) * dx;
    
    let y;
    if (neuronCount == 0) {
      y = cy;
    } else {
      y = cy + (this.getIndex() - (neuronCount - 1) / 2) * dy;
    }
    
    return {
      x: x,
      y: y
    };
  }

  reset() {
    this.preActivation = 0;
    this.activation = sigmoid(this.bias);
    this.dActivation = 0;
    this.dPreActivation = 0;
    this.dBias = 0;
  }

  toData() {
    return {
      bias: this.bias
    };
  }

  static fromData(layer, data) {
    layer.addNeuron(data.bias);
  }
}

module.exports = Neuron;

},{"../common/Color":1,"../common/svg":2}],8:[function(require,module,exports){
const svg = require("../common/svg");
const Link = require("./Link");
const Layer = require("./Layer");

class Sequential {
  constructor() {
    this.neurons = [];
    this.links = [];
    this.layers = [];

    this.svgElement = svg.createElement("g");
    
    this.svgLinks = svg.createElement("g");
    this.svgElement.appendChild(this.svgLinks);
    
    this.svgNeurons = svg.createElement("g");
    this.svgElement.appendChild(this.svgNeurons);
  }

  addLayer(neurons) {
    if (neurons == null) neurons = 0;	
    
    const layer = new Layer(this);
    this.layers.push(layer);
    
    for (let i = 0; i < neurons; i++) {
      layer.addNeuron();
    }
    
    return layer;
  }

  addFullyConnectedLayer(neurons) {
    const l0 = this.layers[this.layers.length - 1];
    this.addLayer(neurons);
    const lf = this.layers[this.layers.length - 1];
    for (let i = 0; i < l0.neurons.length; i++) {
      const n0 = l0.neurons[i];
      for (let j = 0; j < lf.neurons.length; j++) {
        const nf = lf.neurons[j];
        this.addLink(n0, nf);
      }
    }
  }

  addLink(n0, nf, weight) {
    const link = new Link(this, n0, nf, weight);
    n0.links.push(link);
    nf.backLinks.push(link);
    this.links.push(link);
    this.svgLinks.appendChild(link.svgElement);
    return link;
  }

  render() {
    this.layers.forEach((layer) => layer.render());
    this.links.forEach((link) => link.render());
  }

  reset() {
    this.layers.forEach((layer) => layer.reset());
  }

  randomizeParameters() {
    this.links.forEach((link) => {
      let weight = 2 + Math.random() * 4;
      if (Math.random() <= 0.5) weight *= -1;
      link.weight = weight;
    });
    
    this.neurons.forEach((neuron) => {
      let bias = 1 + Math.random() * 2;
      if (Math.random() <= 0.5) bias *= -1;
      neuron.bias = bias;
    });
  }

  forward() {
    for (let i = 1; i < this.layers.length; i++) {
      const layer = this.layers[i];
      layer.neurons.forEach((neuron) => {
        neuron.forward();
      });
    }
  }

  backward(learningRate, regularization) {
    let regularizationLoss = 0;
    
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      layer.neurons.forEach((neuron) => {
        regularizationLoss += neuron.backward(regularization);
      });
    }
    
    this.applyGradient(learningRate);
    return regularizationLoss;
  }

  applyGradient(learningRate) {
    this.links.forEach((link) => {
      link.applyGradient(learningRate);
    });
    
    for (let i = 1; i < this.layers.length; i++) {
      const layer = this.layers[i];
      layer.neurons.forEach((neuron) => {
        neuron.applyGradient(learningRate);
      });
    }
  }

  train(args) {
    // TODO decouple data from canvas
    const dataCanvas = args.dataCanvas;
    const learningRate = args.learningRate;
    const regularization = args.regularization;
    const iters = args.iters;

    let regularizationLoss, dataLoss;

    for (let i = 0; i < iters; i++) {
      dataLoss = 0;
      dataCanvas.dataPoints.forEach((dataPoint) => {
        this.reset();
        this.layers[0].neurons[0].activation = dataPoint.x;
        this.layers[0].neurons[1].activation = dataPoint.y;
        this.forward();
        
        const neuron = this.layers[this.layers.length - 1].neurons[0];
        const output = neuron.activation;
        const d = dataPoint.label - output;
        dataLoss += 0.5 * d * d;
        neuron.dActivation = -d;

        regularizationLoss = this.backward(
          learningRate,
          regularization
        );
      });
    }

    return {
      dataLoss: dataLoss,
      regularizationLoss: regularizationLoss
    }
  }

  toData() {
    return {
      layers: this.layers.map((layer) => layer.toData()),
      links: this.links.map((link) => link.toData())
    }
  }

  static fromData(data) {
    const sequential = new Sequential();
    
    data.layers.forEach((layerData) => {
      Layer.fromData(sequential, layerData);
    });
  
    data.links.forEach((linkData) => {
      Link.fromData(sequential, linkData);
    });
    
    return sequential;
  }
}

module.exports = Sequential;

},{"../common/svg":2,"./Layer":5,"./Link":6}],9:[function(require,module,exports){
module.exports = {
  Sequential: require("./Sequential")
};
},{"./Sequential":8}],10:[function(require,module,exports){
const LossPlot = require("./LossPlot");

class ControlPanel {
  constructor(args = {}) {
    this.app = args.app;
    
    this.learningRate = 0.2;
    this.regularization = 0.000009;
    
    const div = this.domElement = document.createElement("div");
    div.className = "control-panel";
    
    this.rows = [];
    this.rowsByLabel = {};
    
    let row;

    row = this.addRow("full");
    const btnRandomize = document.createElement("div");
    btnRandomize.textContent = "randomize network parameters";
    btnRandomize.className = "btn";
    row.cells[0].appendChild(btnRandomize);
    const model = args.neuralNet;
    btnRandomize.addEventListener("click", () => {
      model.randomizeParameters();
    });
    
    const uiLearningRate = this.addRow("slider", "learning rate");
    uiLearningRate.control.min = 1;
    uiLearningRate.control.max = 80;
    uiLearningRate.control.value = Math.round(this.learningRate * 100);
    uiLearningRate.control.addEventListener("change", () => {
      this.learningRate = uiLearningRate.control.value / 100;
    });
    
    const uiRegularization = this.addRow("slider", "regularization");
    uiRegularization.control.min = 0;
    uiRegularization.control.max = 100;
    uiRegularization.control.value = Math.round(this.regularization * 1000000);
    uiRegularization.control.addEventListener("change", () => {
      this.regularization = uiRegularization.control.value / 1000000;
    });
    
    row = this.addRow("text", "loss");
    row.control.className = "formatted-number";
      
    row = this.addRow("full");
    const lossPlot = this.lossPlot = new LossPlot();
    row.cells[0].appendChild(lossPlot.domElement);
  }

  addCell(row) {
    const cell = document.createElement("div");
    cell.className = "control-cell";
    row.appendChild(cell);
    row.cells.push(cell);
    return cell;
  }

  addRow(type, label) {
    const row = document.createElement("div");
    row.cells = [];
    row.className = "control-row";
    this.domElement.appendChild(row);
    this.rows.push(row);
    this.rowsByLabel[label] = row;
    
    let cell;
    
    if (type == "full") {
      cell = document.createElement("div");
      cell.className = "control-cell-full";
      row.appendChild(cell);
      row.cells.push(cell);
    } else {
      cell = this.addCell(row);
      cell.textContent = label;
      
      cell = this.addCell(row);
      let control;
      switch (type) {
        case "slider":
          control = document.createElement("input");
          control.type = "range";
          break;
        case "text":
          control = cell;
          break;
      }
      if (control != cell && control != null) cell.appendChild(control);
      
      row.control = control;
    }
    
    return row;
  }

  update(args) {
    this.rowsByLabel["loss"].control.textContent = args.totalLoss.toFixed(10);
    this.lossPlot.update(args.dataLoss, args.regularizationLoss);
  }
}

module.exports = ControlPanel;

},{"./LossPlot":14}],11:[function(require,module,exports){
const Color = require("../common/Color");
const DataPoint = require("./DataPoint");
const DragBehavior = require("./DragBehavior");

class DataCanvas {
  constructor() {
    this.dataPoints = [];
    const canvas = this.domElement = document.createElement("canvas");
    canvas.width = 250;
    canvas.height = 250;
    this.ctx = canvas.getContext("2d");

    this.width = 50;
    this.height = 50;
    this.pixelColors = [];
    for (let i = 0; i < this.width; i++) {
      this.pixelColors.push([]);
      for (let j = 0; j < this.height; j++) {
        this.pixelColors[i].push(0);
      }
    }

    this.dragBehavior = new DragBehavior(canvas);
    this.dragBehavior.processDragBegin = this.processDragBegin.bind(this);
    this.dragBehavior.processDragProgress = this.processDragProgress.bind(this);
  }

  addDataPoint(x, y, label) {
    const dataPoint = new DataPoint(this, x, y, label);
    this.dataPoints.push(dataPoint);
    return dataPoint;
  }

  render(classify) {
    const ctx = this.ctx;
    const canvas = this.domElement;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const width = this.width;
    const height = this.height;

    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        const label = classify(i / width, j / height);
        const color = Color.lightRed.blend(Color.lightBlue, label);
        this.pixelColors[i][j] = color;
      }
    }

    const fWidth = canvasWidth / width;
    const fHeight = canvasHeight / height;
    const canvasImageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    for (let i = 0; i < canvasImageData.data.length / 4; i++) {
      const y = Math.floor(i / canvasWidth);
      const x = i % canvasWidth;
      const ii = Math.floor(x / fWidth);
      const jj = Math.floor(y / fHeight);
      const color = this.pixelColors[ii][jj];
      canvasImageData.data[4 * i] = Math.round(color.r * 255);
      canvasImageData.data[4 * i + 1] = Math.round(color.g * 255);
      canvasImageData.data[4 * i + 2] = Math.round(color.b * 255);
      canvasImageData.data[4 * i + 3] = 255;
    }
    ctx.putImageData(canvasImageData, 0, 0);

    this.dataPoints.forEach((dataPoint) => dataPoint.render());
  }

  computeCursor(event) {
    const rect = this.domElement.getBoundingClientRect();
    let clientX, clientY;
    if (event.touches == null) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }
    const left = clientX - rect.left;
    const top = clientY - rect.top;
    const cursor = {x: left, y: top};
    event.cursor = cursor;
  }

  processDragBegin(event) {
    for (let i = 0; i < this.dataPoints.length; i++) {
      const dataPoint = this.dataPoints[i];

      const dx = event.cursor.x - dataPoint.x * this.domElement.width;
      const dy = event.cursor.y - dataPoint.y * this.domElement.height;

      const radius = dataPoint.radius;
      const selectionRadius = radius * 3;

      if (dx * dx + dy * dy <= selectionRadius * selectionRadius) {
        const dragState = this.dragBehavior.dragState = {};
        dragState.dataPoint = dataPoint;
        dragState.offset = {x: dx, y: dy};
        break;
      }
    };
  }

  processDragProgress(event) {
    const dataPoint = this.dragBehavior.dragState.dataPoint;
    const offset = this.dragBehavior.dragState.offset;

    dataPoint.x = (event.cursor.x - offset.x) / this.domElement.width;
    dataPoint.y = (event.cursor.y - offset.y) / this.domElement.height;

    if (dataPoint.x < 0) dataPoint.x = 0;
    else if (dataPoint.x > 1) dataPoint.x = 1;
    if (dataPoint.y < 0) dataPoint.y = 0;
    else if (dataPoint.y > 1) dataPoint.y = 1;
  }

  toData() {
    const data = this.dataPoints.map((dataPoint) => dataPoint.toData());
    return data;
  }

  static fromData(data) {
    const dataCanvas = new DataCanvas();
    data.forEach((item) => {
      dataCanvas.addDataPoint(item.x, item.y, item.label);
    });
    return dataCanvas;
  }
}

module.exports = DataCanvas;

},{"../common/Color":1,"./DataPoint":12,"./DragBehavior":13}],12:[function(require,module,exports){
const Color = require("../common/Color");

class DataPoint {
  constructor(canvas, x, y, label) {
    this.canvas = canvas;
    this.x = x;
    this.y = y;
    this.label = label;
    this.radius = 5;
  }

  render() {
    const ctx = this.canvas.ctx;
    const width = this.canvas.domElement.width;
    const height = this.canvas.domElement.height;
    
    let fillColor;
    if (this.label == 0) fillColor = Color.red;
    else fillColor = Color.blue;
    const strokeColor = fillColor.blend(Color.black, 0.6);
    
    ctx.beginPath();
    ctx.fillStyle = fillColor.toString();
    ctx.strokeStyle = strokeColor.toString();
    ctx.arc(
      this.x * width, this.y * height,
      this.radius,
      0, 2 * Math.PI
    );
    ctx.fill();
    ctx.stroke();
  }

  toData() {
    return {
      x: this.x,
      y: this.y,
      label: this.label
    }
  }
}

module.exports = DataPoint;
},{"../common/Color":1}],13:[function(require,module,exports){
class DragBehavior {
  constructor(canvas) {
    this.canvas = canvas;

    this._onDragBegin = this.onDragBegin.bind(this);
    canvas.addEventListener("mousedown", this._onDragBegin, {passive: false});
    canvas.addEventListener("touchstart", this._onDragBegin, {passive: false});
    
    this._onDragProgress = this.onDragProgress.bind(this);
    canvas.addEventListener("mousemove", this._onDragProgress, {passive: false});
    canvas.addEventListener("touchmove", this._onDragProgress, {passive: false});

    this._onDragEnd = this.onDragEnd.bind(this);
    window.addEventListener("mouseup", this._onDragEnd);
    window.addEventListener("touchend", this._onDragEnd);
    window.addEventListener("touchcancel", this._onDragEnd);
  }

  computeCursor(event) {
    const rect = this.canvas.getBoundingClientRect();
    let clientX, clientY;
    if (event.touches == null) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }
    const left = clientX - rect.left;
    const top = clientY - rect.top;
    const cursor = {x: left, y: top};
    event.cursor = cursor;
  }

  onDragBegin(event) {
    event.preventDefault();
    this.computeCursor(event);
    this.processDragBegin(event);
  }

  onDragProgress(event) {
    if (this.dragState == null) return;
    event.preventDefault();
    this.computeCursor(event);
    this.processDragProgress(event);
  }

  onDragEnd(event) {
    this.dragState = null;
  }
}

module.exports = DragBehavior;
},{}],14:[function(require,module,exports){
const minTopLoss = 4;

class LossPlot {
  constructor() {
    const canvas = this.domElement = document.createElement("canvas");
    canvas.className = "loss-plot-canvas";
    this.ctx = canvas.getContext("2d");	
    this.maxDataLength = canvas.width;
    this.data = [];
    this.topLoss = minTopLoss;
  }

  update(dataLoss, regularizationLoss) {
    if (this.data.length == this.maxDataLength) this.data.shift();

    const totalLoss = dataLoss + regularizationLoss;
    this.data.push({
      dataLoss: dataLoss,
      regularizationLoss: regularizationLoss,
      totalLoss: totalLoss
    });

    const totalLosses = this.data.map((item) => item.totalLoss)
    const maxTotalLoss = Math.max.apply(null, totalLosses);
    if (maxTotalLoss > minTopLoss) this.topLoss = maxTotalLoss;
    else this.topLoss = minTopLoss;

    this.render();
  }

  render() {
    const ctx = this.ctx;
    const width = this.domElement.width;
    const height = this.domElement.height;
    ctx.clearRect(0, 0, width, height);
    
    this.data.forEach((item, i) => {
      const totalLoss = item.totalLoss;
      const x = i / (this.maxDataLength - 1) * width;
      const y = height * (1 - totalLoss / this.topLoss);
      ctx.beginPath();
      ctx.strokeStyle = "rgb(255, 221, 78)";
      ctx.moveTo(x, height);
      ctx.lineTo(x, y);
      ctx.stroke();
    });
  }
}

module.exports = LossPlot;
},{}],15:[function(require,module,exports){
function init(onReady) {
  const link = document.createElement("link");
  link.onload = onReady;
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = "css/main.css";
  document.head.appendChild(link);
}

module.exports = {
  init: init,
  ControlPanel: require("./ControlPanel"),
  DataCanvas: require("./DataCanvas")
};
},{"./ControlPanel":10,"./DataCanvas":11}]},{},[4]);
