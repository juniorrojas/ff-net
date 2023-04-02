(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const ffnet = require("ff-net");
const ControlPanel = require("./ControlPanel");
const nn = ffnet.nn;
const svg = ffnet.common.svg;
const ui = ffnet.ui;

class App {
  constructor(data) {
    const container = document.createElement("div");
    container.className = "content-container";
    this.domElement = container;
    
    let row;
    
    row = document.createElement("div");
    container.appendChild(row);
    row.className = "content-container-row";
    
    const svgModel = svg.createElement("svg");
    svgModel.class = "content-container-cell";
    svgModel.id = "neural-net";
    row.appendChild(svgModel);
    
    const model = this.model = nn.Sequential.fromData({
      data: data.model,
      headless: false
    });
    svgModel.appendChild(model.svgElement);
    
    const dataCanvas = this.dataCanvas = ui.DataCanvas.fromData(data.dataPoints);
    dataCanvas.domElement.classList.add("content-container-cell");
    dataCanvas.domElement.id = "data-canvas";
    row.appendChild(dataCanvas.domElement);
    
    row = document.createElement("div");
    container.appendChild(row);
    row.className = "content-container-row";
    
    const controlPanel = this.controlPanel = new ControlPanel({
      app: this,
      neuralNet: model
    });
    controlPanel.domElement.classList.add("content-container-cell");
    row.appendChild(controlPanel.domElement);

    this.paused = false;
    
    this.update();
  }

  update() {
    if (!this.paused) {
      const model = this.model;
      const dataCanvas = this.dataCanvas;

      const { dataLoss, regularizationLoss } = model.train({
        lr: this.controlPanel.learningRate,
        regularization: this.controlPanel.regularization,
        iters: 10,
        dataCanvas: dataCanvas
      });
      
      model.render();
      const classify = (x, y) => {
        model.getInputNeuronGroup().setActivations([x, y]);
        model.forward();
        return model.getOutputNeuronGroup().neurons[0].activation;
      }
      this.classify = classify;
      dataCanvas.render(classify);
      this.controlPanel.update({
        dataLoss: dataLoss,
        regularizationLoss: regularizationLoss
      });
    }

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

  pause() {
    this.paused = true;
  }

  unpause() {
    this.paused = false;
  }
}

module.exports = App;
},{"./ControlPanel":2,"ff-net":9}],2:[function(require,module,exports){
const ffnet = require("ff-net");
const LossPlot = ffnet.ui.LossPlot;
const Slider = require("./Slider");

class ControlPanel {
  constructor(args = {}) {
    this.app = args.app;
    
    this.learningRate = 0.08;
    this.regularization = 0.00002;
    
    const div = this.domElement = document.createElement("div");
    div.classList.add("control-panel");
    
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
    
    const uiLearningRate = this.addRow(
      "slider", "learning rate",
      {
        min: 0.005,
        max: 0.5,
        step: 0.01,
        value: this.learningRate
      }
    );
    uiLearningRate.control.domElement.addEventListener("input", () => {
      this.learningRate = parseFloat(uiLearningRate.control.domElement.value);
    });
    
    const uiRegularization = this.addRow(
      "slider", "regularization",
      {
        min: 0,
        max: 0.0001,
        step: 0.000001,
        value: this.regularization
      }
    );
    uiRegularization.control.domElement.addEventListener("input", () => {
      this.regularization = parseFloat(uiRegularization.control.domElement.value);
    });
    
    row = this.addRow("text", "loss");
    row.control.className = "formatted-number";
    
    row = this.addRow("full");
    const lossPlot = this.lossPlot = new LossPlot();
    lossPlot.domElement.className = "loss-plot-canvas";
    row.cells[0].appendChild(lossPlot.domElement);
  }

  addCell(row) {
    const cell = document.createElement("div");
    cell.className = "control-cell";
    row.appendChild(cell);
    row.cells.push(cell);
    return cell;
  }

  addRow(type, label, controlArgs = {}) {
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
          control = new Slider(controlArgs);
          break;
        case "text":
          control = cell;
          break;
      }
      if (control != cell && control != null) cell.appendChild(control.domElement);
      
      row.control = control;
    }
    
    return row;
  }

  update(args) {
    if (args.dataLoss == null) {
      throw new Error("dataLoss required to update panel");
    }
    if (args.regularizationLoss == null) {
      throw new Error("regularizationLoss required to update panel");
    }
    const totalLoss = args.dataLoss + args.regularizationLoss;
    this.rowsByLabel["loss"].control.textContent = totalLoss.toFixed(10);
    this.lossPlot.push(totalLoss);
  }
}

module.exports = ControlPanel;

},{"./Slider":3,"ff-net":9}],3:[function(require,module,exports){
class Slider {
  constructor(args = {}) {
    const input = document.createElement("input");
    this.domElement = input;
    input.type = "range";
    input.min = args.min ?? 0;
    input.max = args.max ?? 100;
    input.step = args.step ?? 1;
    if (args.value != null) {
      input.value = args.value;
    }
  }
}

module.exports = Slider;
},{}],4:[function(require,module,exports){
module.exports={"dataPoints":[{"x":0.08,"y":0.24,"label":1},{"x":0.2,"y":0.27,"label":1},{"x":0.05,"y":0.3,"label":1},{"x":0.1,"y":0.1,"label":1},{"x":0.4,"y":0.4,"label":0},{"x":0.6,"y":0.4,"label":0},{"x":0.65,"y":0.7,"label":0},{"x":0.7,"y":0.3,"label":0},{"x":0.35,"y":0.65,"label":0},{"x":0.3,"y":0.5,"label":0},{"x":0.7,"y":0.5,"label":0},{"x":0.75,"y":0.55,"label":0},{"x":0.7,"y":0.6,"label":0},{"x":0.65,"y":0.34,"label":0},{"x":0.8,"y":0.65,"label":0},{"x":0.5,"y":0.7,"label":0},{"x":0.5,"y":0.66,"label":0},{"x":0.56,"y":0.66,"label":0},{"x":0.46,"y":0.36,"label":0},{"x":0.46,"y":0.26,"label":0},{"x":0.36,"y":0.26,"label":0},{"x":0.26,"y":0.36,"label":0},{"x":0.56,"y":0.28,"label":0},{"x":0.33,"y":0.54,"label":0},{"x":0.23,"y":0.52,"label":0},{"x":0.26,"y":0.16,"label":1},{"x":0.06,"y":0.46,"label":1},{"x":0.13,"y":0.66,"label":1},{"x":0.2,"y":0.8,"label":1},{"x":0.5,"y":0.5,"label":1},{"x":0.45,"y":0.5,"label":1},{"x":0.5,"y":0.45,"label":1},{"x":0.45,"y":0.45,"label":1},{"x":0.55,"y":0.55,"label":1},{"x":0.5,"y":0.55,"label":1},{"x":0.5,"y":0.2,"label":1},{"x":0.4,"y":0.1,"label":1},{"x":0.6,"y":0.1,"label":1},{"x":0.75,"y":0.15,"label":1},{"x":0.88,"y":0.22,"label":1},{"x":0.9,"y":0.35,"label":1},{"x":0.9,"y":0.49,"label":1},{"x":0.88,"y":0.62,"label":1},{"x":0.9,"y":0.9,"label":1},{"x":0.9,"y":0.8,"label":1},{"x":0.75,"y":0.85,"label":1},{"x":0.55,"y":0.92,"label":1},{"x":0.6,"y":0.95,"label":1},{"x":0.06,"y":0.57,"label":1},{"x":0.09,"y":0.8,"label":1},{"x":0.4,"y":0.9,"label":1}],"model":{"neuronGroups":[{"neurons":[{"bias":0.5},{"bias":0.5}]},{"neurons":[{"bias":0.5},{"bias":0.5},{"bias":0.5},{"bias":0.5},{"bias":0.5}]},{"neurons":[{"bias":0.5},{"bias":0.5},{"bias":0.5},{"bias":0.5},{"bias":0.5}]},{"neurons":[{"bias":0.5},{"bias":0.5}]},{"neurons":[{"bias":0.5}]}],"links":[{"n0":[0,0],"nf":[1,0],"weight":2.2559318523672673},{"n0":[0,0],"nf":[1,1],"weight":3.7705902078344162},{"n0":[0,0],"nf":[1,2],"weight":-5.673868837964195},{"n0":[0,0],"nf":[1,3],"weight":-2.552116396138559},{"n0":[0,0],"nf":[1,4],"weight":-4.765897189158554},{"n0":[0,1],"nf":[1,0],"weight":2.522847383501193},{"n0":[0,1],"nf":[1,1],"weight":-2.9902303588384505},{"n0":[0,1],"nf":[1,2],"weight":2.749623598598969},{"n0":[0,1],"nf":[1,3],"weight":-2.0657459601688077},{"n0":[0,1],"nf":[1,4],"weight":2.311040191441733},{"n0":[1,0],"nf":[2,0],"weight":-2.8083933750840506},{"n0":[1,0],"nf":[2,1],"weight":2.368208438212055},{"n0":[1,0],"nf":[2,2],"weight":2.792010178964303},{"n0":[1,0],"nf":[2,3],"weight":2.1204797088106764},{"n0":[1,0],"nf":[2,4],"weight":3.0855603411983634},{"n0":[1,1],"nf":[2,0],"weight":-2.1619760012233913},{"n0":[1,1],"nf":[2,1],"weight":2.7735676578848043},{"n0":[1,1],"nf":[2,2],"weight":-4.795321974592097},{"n0":[1,1],"nf":[2,3],"weight":-3.1618858651724424},{"n0":[1,1],"nf":[2,4],"weight":2.642537468325151},{"n0":[1,2],"nf":[2,0],"weight":5.111269168104936},{"n0":[1,2],"nf":[2,1],"weight":1.8060793114773712},{"n0":[1,2],"nf":[2,2],"weight":1.2874475479043777},{"n0":[1,2],"nf":[2,3],"weight":3.715659708889894},{"n0":[1,2],"nf":[2,4],"weight":-5.479057778095251},{"n0":[1,3],"nf":[2,0],"weight":4.279970838297447},{"n0":[1,3],"nf":[2,1],"weight":-3.8573191202934085},{"n0":[1,3],"nf":[2,2],"weight":-4.346636276004062},{"n0":[1,3],"nf":[2,3],"weight":1.8026421918582567},{"n0":[1,3],"nf":[2,4],"weight":3.9687935202147346},{"n0":[1,4],"nf":[2,0],"weight":-3.5216391228147197},{"n0":[1,4],"nf":[2,1],"weight":4.599458665307638},{"n0":[1,4],"nf":[2,2],"weight":-4.752572287153145},{"n0":[1,4],"nf":[2,3],"weight":-3.810827524569661},{"n0":[1,4],"nf":[2,4],"weight":3.0650028924296953},{"n0":[2,0],"nf":[3,0],"weight":-4.300364295192499},{"n0":[2,0],"nf":[3,1],"weight":-2.9036061692080217},{"n0":[2,1],"nf":[3,0],"weight":4.132576329093505},{"n0":[2,1],"nf":[3,1],"weight":-3.817976850598705},{"n0":[2,2],"nf":[3,0],"weight":4.606542085589321},{"n0":[2,2],"nf":[3,1],"weight":2.8220313920923323},{"n0":[2,3],"nf":[3,0],"weight":2.3423002019828885},{"n0":[2,3],"nf":[3,1],"weight":2.098573708791525},{"n0":[2,4],"nf":[3,0],"weight":4.4760505444141625},{"n0":[2,4],"nf":[3,1],"weight":3.95752484391276},{"n0":[3,0],"nf":[4,0],"weight":-0.7265226578414495},{"n0":[3,1],"nf":[4,0],"weight":-4.316679309853457}]}}
},{}],5:[function(require,module,exports){
const App = require("./App");

function main() {
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
  window.initData = data;
  const app = new App(data);
  document.body.appendChild(app.domElement);
  window.app = app;
}

main();
},{"./App":1,"./data":4}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
module.exports = {
  Color: require("./Color"),
  svg: require("./svg")
};
},{"./Color":6,"./svg":8}],8:[function(require,module,exports){
const svg = {};

svg.createElement = function(element) {
  return document.createElementNS("http://www.w3.org/2000/svg", element);
}

module.exports = svg;

},{}],9:[function(require,module,exports){
const nn = require("./nn");

module.exports = {
  ui: require("./ui"),
  common: require("./common"),
  nn: nn,
  Sequential: nn.Sequential
};
},{"./common":7,"./nn":15,"./ui":20}],10:[function(require,module,exports){
class Layer {
  constructor(args = {}) {
    if (args.inputNeuronGroup == null) {
      throw new Error("inputNeuronGroup required to create layer");
    }
    if (args.outputNeuronGroup == null) {
      throw new Error("outputNeuronGroup required to create layer");
    }
    this.inputNeuronGroup = args.inputNeuronGroup;
    this.outputNeuronGroup = args.outputNeuronGroup;
  }

  getBiasArray() {
    const b = [];
    this.outputNeuronGroup.neurons.forEach(neuron => {
      b.push(neuron.bias);
    });
    return b;
  }

  getBiasGradArray() {
    const b = [];
    this.outputNeuronGroup.neurons.forEach(neuron => {
      b.push(neuron.biasGrad);
    });
    return b;
  }

  setBiasFromArray(arr) {
    const outputNeurons = this.outputNeuronGroup.neurons;
    if (arr.length != outputNeurons.length) {
      throw new Error(`invalid bias size, found ${arr.length}, expected ${outputNeurons.length}`);
    }
    outputNeurons.forEach((neuron, i) => {
      neuron.bias = arr[i];
    });
  }

  getWeightArray() {
    const w = [];

    this.outputNeuronGroup.neurons.forEach(neuron => {
      const wi = [];
      w.push(wi);
      neuron.backLinks.forEach(link => {
        wi.push(link.weight);
      });      
    });

    return w;
  }

  getWeightGradArray() {
    const w = [];

    this.outputNeuronGroup.neurons.forEach(neuron => {
      const wi = [];
      w.push(wi);
      neuron.backLinks.forEach(link => {
        wi.push(link.weightGrad);
      });      
    });

    return w;
  }

  setWeightFromArray(arr) {
    this.inputNeuronGroup.neurons.forEach((inputNeuron, j) => {
      inputNeuron.links.forEach((link, i) => {
        link.weight = arr[i][j];
      });
    });
  }
}

module.exports = Layer;
},{}],11:[function(require,module,exports){
class Link {
  constructor(neuralNet, n0, nf, weight) {
    this.neuralNet = neuralNet;

    this.n0 = n0;
    this.nf = nf;
    
    if (this.n0.group.getIndex() + 1 != this.nf.group.getIndex()) {
      throw "Cannot connect neurons from non-consecutive groups";
    }
    
    if (weight == null) this.weight = 1;
    else this.weight = weight;
    this.weightGrad = 0;
    
    const headless = neuralNet.headless;
    this.headless = headless;
    if (!headless) {
      const svg = require("../common/svg");
      this.svgElement = svg.createElement("path");
      this.render();
    }
  }

  render() {
    const Color = require("../common/Color");

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

  zeroGrad() {
    this.weightGrad = 0.0
  }

  backward(args = {}) {
    this.weightGrad = this.n0.activation * this.nf.preActivationGrad;
  }

  forwardRegularization(args = {}) {
    const regularization = args.regularization ?? 0.0;
    return regularization * this.weight * this.weight * 0.5;
  }
  
  backwardRegularization(args = {}) {
    const regularization = args.regularization ?? 0.0;
    this.weightGrad += regularization * this.weight;
  }

  optimStep(lr) {
    if (lr == null) {
      throw new Error("lr required");
    }
    this.weight -= lr * this.weightGrad;
  }

  toData() {
    const data = {};
    data.n0 = [
      this.n0.group.getIndex(),
      this.n0.getIndex()
    ];
    data.nf = [
      this.nf.group.getIndex(),
      this.nf.getIndex()
    ];
    data.weight = this.weight;
    return data;
  }

  static fromData(neuralNet, data) {
    const weight = data.weight;
    const a = data.n0;
    const b = data.nf;
    const n0 = neuralNet.neuronGroups[a[0]].neurons[a[1]];
    const nf = neuralNet.neuronGroups[b[0]].neurons[b[1]];
    const link = neuralNet.addLink(n0, nf, weight);
    return link;
  }
}

module.exports = Link;

},{"../common/Color":6,"../common/svg":8}],12:[function(require,module,exports){
const radius = 12;
const strokeWidth = 2;

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function sigmoidBackward(x, outputGrad) {
  const s = sigmoid(x);
  return s * (1 - s) * outputGrad;
}

class Neuron {
  constructor(group, bias) {
    this.group = group;
    this.links = [];
    this.backLinks = [];

    this.bias = bias;
    this.preActivation = 0;
    this.activation = sigmoid(this.bias);

    this.activationGrad = 0;
    this.preActivationGrad = 0;
    this.biasGrad = 0;
    
    const headless = group.parent.headless;
    this.headless = headless;
    
    if (!headless) {
      const svg = require("../common/svg");
      const svgElement = this.svgElement = svg.createElement("circle");
      svgElement.setAttribute("r", radius);
    }
  }

  forward() {
    this.preActivation = 0;
    this.preActivation += this.bias;
    this.backLinks.forEach((link) => {
      this.preActivation += link.weight * link.n0.activation;
    });
    this.activation = sigmoid(this.preActivation);
  }

  backward(args = {}) {
    this.links.forEach((link) => {
      this.activationGrad += link.weight * link.nf.preActivationGrad;
    });
    
    this.preActivationGrad = sigmoidBackward(this.preActivation, this.activationGrad);
    this.biasGrad = this.preActivationGrad;
    
    this.backLinks.forEach((link) => {
      link.backward(args);
    });
  }

  optimStep(lr) {
    if (lr == null) {
      throw new Error("lr required");
    }
    this.bias -= lr * this.biasGrad;
  }

  render() {
    const Color = require("../common/Color");
    
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
    return this.group.neurons.indexOf(this);
  }

  getPosition() {
    const model = this.group.parent;
    const numNeurons = this.group.numNeurons();
    const numNeuronGroups = model.numNeuronGroups();
    const maxNumNeuronsPerGroup = 5;
    
    const container = model.svgElement.parentNode;
    if (container == null) return {x: 0, y: 0};
    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;
    
    const cy = height / 2;
    const cx = width / 2;
    
    const dx = (width - (radius + strokeWidth) * 2) / (numNeuronGroups - 1);
    const dy = (height - (radius + strokeWidth) * 2) / (maxNumNeuronsPerGroup - 1);
    
    const x = cx + (this.group.getIndex() - (numNeuronGroups - 1) / 2) * dx;
    
    let y;
    if (numNeurons == 0) {
      y = cy;
    } else {
      y = cy + (this.getIndex() - (numNeurons - 1) / 2) * dy;
    }
    
    return {
      x: x,
      y: y
    };
  }

  zeroGrad() {
    this.activationGrad = 0;
    this.preActivationGrad = 0;
    this.biasGrad = 0;
  }

  toData() {
    return {
      bias: this.bias
    };
  }

  static fromData(group, data) {
    group.addNeuron(data.bias);
  }
}

module.exports = Neuron;

},{"../common/Color":6,"../common/svg":8}],13:[function(require,module,exports){
const Neuron = require("./Neuron");

class NeuronGroup {
  constructor(parent) {
    this.parent = parent;
    this.neurons = [];

    this.headless = parent.headless;
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
    if (!this.headless) {
      this.parent.svgNeurons.appendChild(neuron.svgElement);
    }
    return neuron;
  }

  numNeurons() {
    return this.neurons.length;
  }

  getIndex() {
    return this.parent.neuronGroups.indexOf(this);
  }

  setActivations(arr) {
    const n = this.numNeurons();
    if (arr.length != n) {
      throw new Error(`expected ${n} values, found ${arr.length}`);
    }
    for (let i = 0; i < n; i++) {
      this.neurons[i].activation = arr[i];
    }
  }

  getActivations() {
    return this.neurons.map(neuron => neuron.activation);
  }

  toData() {
    const data = {
      neurons: this.neurons.map((neuron) => neuron.toData())
    };
    return data;
  }

  static fromData(neuralNet, data) {
    const neuronGroup = neuralNet.addNeuronGroup();
    data.neurons.forEach((neuronData) => {
      Neuron.fromData(neuronGroup, neuronData);
    });
  }
}

module.exports = NeuronGroup;

},{"./Neuron":12}],14:[function(require,module,exports){
const Link = require("./Link");
const NeuronGroup = require("./NeuronGroup");
const Layer = require("./Layer");

class Sequential {
  constructor(args = {}) {
    this.neurons = [];
    this.links = [];
    this.neuronGroups = [];
    this.layers = [];

    const headless = args.headless ?? true;
    this.headless = headless;
    if (!headless) {
      const svg = require("../common/svg");

      this.svgElement = svg.createElement("g");
    
      this.svgLinks = svg.createElement("g");
      this.svgElement.appendChild(this.svgLinks);
      
      this.svgNeurons = svg.createElement("g");
      this.svgElement.appendChild(this.svgNeurons);
    }
  }

  clear() {
    if (!this.headless) {
      while (this.svgLinks.firstChild != null) {
        this.svgLinks.removeChild(this.svgLinks.firstChild);
      }

      while (this.svgNeurons.firstChild != null) {
        this.svgNeurons.removeChild(this.svgNeurons.firstChild);
      }
    }

    this.links = [];
    this.neuronGroups = [];
    this.layers = [];
    this.neurons = [];
  }

  numNeuronGroups() {
    return this.neuronGroups.length;
  }

  numLayers() {
    return this.layers.length;
  }

  numNeurons() {
    return this.neurons.length;
  }

  numLinks() {
    return this.links.length;
  }

  getInputNeuronGroup() {
    if (this.neuronGroups.length == 0) {
      throw new Error("no neuron groups available");
    }
    return this.neuronGroups[0];
  }

  getOutputNeuronGroup() {
    if (this.neuronGroups.length == 0) {
      throw new Error("no neuron groups available");
    }
    return this.neuronGroups[this.neuronGroups.length - 1];
  }

  addNeuronGroup(neurons) {
    if (neurons == null) neurons = 0;	
    
    const group = new NeuronGroup(this);
    this.neuronGroups.push(group);
    
    for (let i = 0; i < neurons; i++) {
      group.addNeuron();
    }
    
    return group;
  }

  addFullyConnectedLayer(neurons) {
    if (this.neuronGroups.length == 0) {
      throw new Error("cannot add fully connected layer if no neuron groups exist");
    }
    if (neurons == null) {
      throw new Error("number of output neurons required to create fully connected layer");
    }
    const inputGroup = this.getOutputNeuronGroup();
    this.addNeuronGroup(neurons);
    const outputGroup = this.getOutputNeuronGroup();
    inputGroup.neurons.forEach((inputNeuron) => {
      outputGroup.neurons.forEach((outputNeuron) => {
        this.addLink(inputNeuron, outputNeuron);
      });
    });

    const layer = new Layer({
      inputNeuronGroup: inputGroup,
      outputNeuronGroup: outputGroup
    });
    this.layers.push(layer);
    return layer;
  }

  addLink(n0, nf, weight) {
    const link = new Link(this, n0, nf, weight);
    n0.links.push(link);
    nf.backLinks.push(link);
    this.links.push(link);
    if (!this.headless) {
      this.svgLinks.appendChild(link.svgElement);
    }
    return link;
  }

  render() {
    this.neuronGroups.forEach((group) => group.render());
    this.links.forEach((link) => link.render());
  }

  zeroGrad() {
    this.neurons.forEach(neuron => {
      neuron.zeroGrad();
    });
    this.links.forEach(link => {
      link.zeroGrad();
    });
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
    for (let i = 1; i < this.neuronGroups.length; i++) {
      const group = this.neuronGroups[i];
      group.neurons.forEach((neuron) => {
        neuron.forward();
      });
    }
  }

  backward(args = {}) {
    for (let i = this.neuronGroups.length - 1; i >= 0; i--) {
      const group = this.neuronGroups[i];
      group.neurons.forEach((neuron) => {
        neuron.backward(args);
      });
    }
  }

  forwardRegularization(args = {}) {
    const regularization = args.regularization ?? 0.0;
    let loss = 0.0;
    this.links.forEach(link => {
      const w = link.weight;
      loss += 0.5 * regularization * w * w;
    });
    return loss;
  }

  backwardRegularization(args = {}) {
    this.links.forEach(link => {
      link.backwardRegularization(args);
    });
  }

  optimStep(lr) {
    if (lr == null) {
      throw new Error("lr required");
    }

    this.links.forEach((link) => {
      link.optimStep(lr);
    });
    
    for (let i = 1; i < this.neuronGroups.length; i++) {
      const group = this.neuronGroups[i];
      group.neurons.forEach((neuron) => {
        neuron.optimStep(lr);
      });
    }
  }

  train(args) {
    // TODO decouple data from canvas
    const dataCanvas = args.dataCanvas;
    const lr = args.lr;
    const regularization = args.regularization;
    const iters = args.iters;

    let regularizationLoss, dataLoss;

    const inputNeuronGroup = this.getInputNeuronGroup();
    const outputNeuronGroup = this.getOutputNeuronGroup();
    for (let i = 0; i < iters; i++) {
      dataLoss = 0;
      dataCanvas.dataPoints.forEach((dataPoint) => {
        // TODO generalize, do not assume 2D input
        inputNeuronGroup.neurons[0].activation = dataPoint.x;
        inputNeuronGroup.neurons[1].activation = dataPoint.y;
        this.forward();
        
        const neuron = outputNeuronGroup.neurons[0];
        const output = neuron.activation;
        const d = dataPoint.label - output;
        // forwardData
        dataLoss += 0.5 * d * d;
        
        this.zeroGrad();
        neuron.activationGrad = -d;

        regularizationLoss = this.forwardRegularization({
          regularization: regularization
        });
        this.backward();
        this.backwardRegularization({
          regularization: regularization
        });

        this.optimStep(lr);
      });
    }

    return {
      dataLoss: dataLoss,
      regularizationLoss: regularizationLoss
    }
  }

  toData() {
    return {
      groups: this.neuronGroups.map((group) => group.toData()),
      links: this.links.map((link) => link.toData())
    }
  }

  loadData(data) {
    this.clear();

    data.neuronGroups.forEach((groupData) => {
      NeuronGroup.fromData(this, groupData);
    });
  
    data.links.forEach((linkData) => {
      Link.fromData(this, linkData);
    });
  }

  static fromData(args = {}) {
    const data = args.data;
    const headless = args.headless;

    const sequential = new Sequential({
      headless: headless
    });
    
    sequential.loadData(data);
    
    return sequential;
  }
}

module.exports = Sequential;

},{"../common/svg":8,"./Layer":10,"./Link":11,"./NeuronGroup":13}],15:[function(require,module,exports){
module.exports = {
  Sequential: require("./Sequential")
};
},{"./Sequential":14}],16:[function(require,module,exports){
const Color = require("../common/Color");
const DataPoint = require("./DataPoint");
const DragBehavior = require("./DragBehavior");

class DataCanvas {
  constructor(args = {}) {
    this.dataPoints = [];
    const canvas = this.domElement = document.createElement("canvas");
    canvas.width = args.domWidth ?? 250;
    canvas.height = args.domHeight ?? 250;
    this.ctx = canvas.getContext("2d");

    this.width = args.dataWidth ?? 50;
    this.height = args.dataHeight ?? 50;
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
      const offset = 4 * i
      canvasImageData.data[offset    ] = Math.round(color.r * 255);
      canvasImageData.data[offset + 1] = Math.round(color.g * 255);
      canvasImageData.data[offset + 2] = Math.round(color.b * 255);
      canvasImageData.data[offset + 3] = 255;
    }
    ctx.putImageData(canvasImageData, 0, 0);

    this.dataPoints.forEach((dataPoint) => dataPoint.render());
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

  loadFromData(data) {
    this.dataPoints = [];
    data.forEach((item) => {
      this.addDataPoint(item.x, item.y, item.label);
    });
  }

  static fromData(data) {
    const dataCanvas = new DataCanvas();
    dataCanvas.loadFromData(data);
    return dataCanvas;
  }
}

module.exports = DataCanvas;

},{"../common/Color":6,"./DataPoint":17,"./DragBehavior":18}],17:[function(require,module,exports){
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
},{"../common/Color":6}],18:[function(require,module,exports){
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

  dragging() {
    return this.dragState != null;
  }
}

module.exports = DragBehavior;
},{}],19:[function(require,module,exports){
class LossPlot {
  constructor(args = {}) {
    const width = args.width ?? 500;
    const height = args.height ?? 100;
    const canvas = this.domElement = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    this.ctx = canvas.getContext("2d");	
    this.maxDataLength = width;
    this.data = [];
    this.minTopLoss = args.minTopLoss ?? 4;
    this.topLoss = this.minTopLoss;
  }

  push(totalLoss) {
    if (this.data.length == this.maxDataLength) this.data.shift();
    
    this.data.push({
      totalLoss: totalLoss
    });

    const totalLosses = this.data.map((item) => item.totalLoss)
    const maxTotalLoss = Math.max.apply(null, totalLosses);
    if (maxTotalLoss > this.minTopLoss) this.topLoss = maxTotalLoss;
    else this.topLoss = this.minTopLoss;

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
      ctx.lineWidth = 2;
      ctx.moveTo(x, height);
      ctx.lineTo(x, y);
      ctx.stroke();
    });
  }

  clear() {
    this.data = [];
  }
}

module.exports = LossPlot;
},{}],20:[function(require,module,exports){
module.exports = {
  DataCanvas: require("./DataCanvas"),
  LossPlot: require("./LossPlot")
};
},{"./DataCanvas":16,"./LossPlot":19}]},{},[5]);
