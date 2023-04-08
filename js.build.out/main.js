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
    
    const model = this.model = nn.Sequential.fromData(
      data.model,
      {
        headless: false,
        createDomElement: true
      }
    );
    
    // const model = this.model = new nn.Sequential({
    //   headless: false,
    //   createDomElement: true
    // });
    // model.addNeuronGroup(2);
    // model.addFullyConnectedLayer(4);
    // model.addFullyConnectedLayer(3);
    // model.addFullyConnectedLayer(1);
    
    model.domElement.classList.add("content-container-cell");
    model.setRenderSize(300, 250);
    row.appendChild(model.domElement);
    
    const dataCanvas = this.dataCanvas = ui.DataCanvas.fromData(data.dataPoints);
    dataCanvas.domElement.classList.add("content-container-cell");
    dataCanvas.domElement.id = "data-canvas";
    row.appendChild(dataCanvas.domElement);
    
    row = document.createElement("div");
    container.appendChild(row);
    row.className = "content-container-row";
    
    const controlPanel = this.controlPanel = new ControlPanel({
      model: model
    });
    controlPanel.domElement.classList.add("content-container-cell");
    row.appendChild(controlPanel.domElement);

    this.paused = false;

    dataCanvas.xyToPixel = (x, y) => {
      model.getInputNeuronGroup().setActivations([x, y]);
      model.forward();
      return model.getOutputNeuronGroup().neurons[0].activation;
    }
    
    this.renderLoop();
    setInterval(() => { this.update() }, 1000 / 60);
  }

  update() {
    if (!this.paused) {
      const model = this.model;
      const dataCanvas = this.dataCanvas;

      const { dataLoss, regularizationLoss } = model.train({
        lr: this.controlPanel.learningRate,
        regularization: this.controlPanel.regularization,
        iters: 10,
        dataPoints: dataCanvas.dataPoints
      });

      this.controlPanel.update({
        dataLoss: dataLoss,
        regularizationLoss: regularizationLoss
      });
    }
  }

  renderLoop() {
    this.model.render();
    this.dataCanvas.render();

    requestAnimationFrame(() => {
      this.renderLoop();
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
},{"./ControlPanel":2,"ff-net":10}],2:[function(require,module,exports){
const LossPlot = require("./LossPlot");
const Slider = require("./Slider");

class Row {
  constructor() {
    const div = this.domElement = document.createElement("div");
    div.className = "control-row";
    this.cells = [];
    this.control = null;
  }

  addCell() {
    const cell = document.createElement("div");
    cell.className = "control-cell";
    this.domElement.appendChild(cell);
    this.cells.push(cell);
    return cell;
  }
}

class ControlPanel {
  constructor(args = {}) {    
    this.learningRate = 0.08;
    this.regularization = 0.001;
    
    const div = this.domElement = document.createElement("div");
    div.classList.add("control-panel");
    
    this.rows = [];
    
    let row;

    row = this.addFullRow();
    const btnRandomize = document.createElement("div");
    btnRandomize.textContent = "randomize network parameters";
    btnRandomize.className = "btn";
    row.cells[0].appendChild(btnRandomize);
    
    const model = args.model;
    btnRandomize.addEventListener("click", () => {
      model.randomizeParameters();
    });
    
    this.addControlRow(
      "slider",
      "learning rate",
      {
        min: 0.005,
        max: 0.5,
        step: 0.01,
        value: this.learningRate,
        onUpdate: (value) => {
          this.learningRate = value;
        }
      }
    );
    
    this.addControlRow(
      "slider",
      "regularization",
      {
        min: 0,
        max: 0.0051,
        step: 0.00001,
        value: this.regularization,
        onUpdate: (value) => {
          this.regularization = value;
        }
      }
    );
    
    row = this.addControlRow("text", "loss");
    row.control.className = "formatted-number";
    this.rowLoss = row;
    
    row = this.addFullRow();
    const lossPlot = this.lossPlot = new LossPlot();
    row.cells[0].appendChild(lossPlot.domElement);
  }

  addRow() {
    const row = new Row();
    this.domElement.appendChild(row.domElement);
    this.rows.push(row);
    return row;
  }

  addFullRow() {
    const row = this.addRow();
    const cell = document.createElement("div");
    cell.className = "control-cell-full";
    row.domElement.appendChild(cell);
    row.cells.push(cell);
    return row;
  }

  addControlRow(type, label, controlArgs = {}) {
    const row = this.addRow();
    
    let cell;
    
    cell = row.addCell();
    cell.textContent = label;
    
    cell = row.addCell();
    let control;
    switch (type) {
      case "slider":
        control = new Slider(controlArgs);
        break;
      case "text":
        control = cell;
        break;
      default:
        throw new Error(`invalid control type ${type}`);
    }
    if (control != cell) cell.appendChild(control.domElement);
    
    row.control = control;
    
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
    this.rowLoss.control.textContent = totalLoss.toFixed(10);
    this.lossPlot.push(totalLoss);
  }
}

module.exports = ControlPanel;

},{"./LossPlot":3,"./Slider":4}],3:[function(require,module,exports){
const ffnet = require("ff-net");

class LossPlot extends ffnet.ui.LossPlot {
  constructor(args = {}) {
    super(args);
    this.domElement.className = "loss-plot";
    
    const mq = window.matchMedia("(max-width: 530px)");

    const updateMq = () => {
      if (mq.matches) {
        this.domElement.style.width = "250px";
        this.domElement.style.height = "50px";
      } else {
        this.domElement.style.width = "500px";
        this.domElement.style.height = "100px";
      }
    }

    mq.addEventListener("change", (event) => {
      updateMq();
    });

    updateMq();
  }
}

module.exports = LossPlot;
},{"ff-net":10}],4:[function(require,module,exports){
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

    if (args.onUpdate != null) {
      input.addEventListener("input", () => {
        const value = parseFloat(input.value);
        args.onUpdate(value);
      });
    }
  }
}

module.exports = Slider;
},{}],5:[function(require,module,exports){
module.exports={"dataPoints":[{"x":0.08,"y":0.24,"label":1},{"x":0.2,"y":0.27,"label":1},{"x":0.05,"y":0.3,"label":1},{"x":0.1,"y":0.1,"label":1},{"x":0.4,"y":0.4,"label":0},{"x":0.6,"y":0.4,"label":0},{"x":0.65,"y":0.7,"label":0},{"x":0.7,"y":0.3,"label":0},{"x":0.35,"y":0.65,"label":0},{"x":0.3,"y":0.5,"label":0},{"x":0.7,"y":0.5,"label":0},{"x":0.75,"y":0.55,"label":0},{"x":0.7,"y":0.6,"label":0},{"x":0.65,"y":0.34,"label":0},{"x":0.8,"y":0.65,"label":0},{"x":0.5,"y":0.7,"label":0},{"x":0.5,"y":0.66,"label":0},{"x":0.56,"y":0.66,"label":0},{"x":0.46,"y":0.36,"label":0},{"x":0.46,"y":0.26,"label":0},{"x":0.36,"y":0.26,"label":0},{"x":0.26,"y":0.36,"label":0},{"x":0.56,"y":0.28,"label":0},{"x":0.33,"y":0.54,"label":0},{"x":0.23,"y":0.52,"label":0},{"x":0.26,"y":0.16,"label":1},{"x":0.06,"y":0.46,"label":1},{"x":0.13,"y":0.66,"label":1},{"x":0.2,"y":0.8,"label":1},{"x":0.5,"y":0.5,"label":1},{"x":0.45,"y":0.5,"label":1},{"x":0.5,"y":0.45,"label":1},{"x":0.45,"y":0.45,"label":1},{"x":0.55,"y":0.55,"label":1},{"x":0.5,"y":0.55,"label":1},{"x":0.5,"y":0.2,"label":1},{"x":0.4,"y":0.1,"label":1},{"x":0.6,"y":0.1,"label":1},{"x":0.75,"y":0.15,"label":1},{"x":0.88,"y":0.22,"label":1},{"x":0.9,"y":0.35,"label":1},{"x":0.9,"y":0.49,"label":1},{"x":0.88,"y":0.62,"label":1},{"x":0.9,"y":0.9,"label":1},{"x":0.9,"y":0.8,"label":1},{"x":0.75,"y":0.85,"label":1},{"x":0.55,"y":0.92,"label":1},{"x":0.6,"y":0.95,"label":1},{"x":0.06,"y":0.57,"label":1},{"x":0.09,"y":0.8,"label":1},{"x":0.4,"y":0.9,"label":1}],"model":{"neuronGroups":[{"neurons":[{"bias":0.5},{"bias":0.5}]},{"neurons":[{"bias":0.2731707327259464},{"bias":0.3131750543526207},{"bias":0.3113708416049979},{"bias":0.4878756278417343},{"bias":0.368218822643312}]},{"neurons":[{"bias":0.5512422501720741},{"bias":0.5672616111773106},{"bias":-0.052479036776262165},{"bias":0.5222729688284673},{"bias":0.01215000568099761}]},{"neurons":[{"bias":0.5001970006319566},{"bias":0.0180989829714042}]},{"neurons":[{"bias":1.9819147663745404}]}],"links":[{"n0":[0,0],"nf":[1,0],"weight":2.2477214362553712},{"n0":[0,0],"nf":[1,1],"weight":4.026412497443965},{"n0":[0,0],"nf":[1,2],"weight":-5.917043453417338},{"n0":[0,0],"nf":[1,3],"weight":-2.68761418492447},{"n0":[0,0],"nf":[1,4],"weight":-4.444127402013615},{"n0":[0,1],"nf":[1,0],"weight":2.6053358948986336},{"n0":[0,1],"nf":[1,1],"weight":-2.732960971580873},{"n0":[0,1],"nf":[1,2],"weight":2.7636999530265784},{"n0":[0,1],"nf":[1,3],"weight":-2.095874033983207},{"n0":[0,1],"nf":[1,4],"weight":2.5249833832053143},{"n0":[1,0],"nf":[2,0],"weight":-2.823233139082371},{"n0":[1,0],"nf":[2,1],"weight":2.3963314743951263},{"n0":[1,0],"nf":[2,2],"weight":2.2151128533448103},{"n0":[1,0],"nf":[2,3],"weight":2.14835431884995},{"n0":[1,0],"nf":[2,4],"weight":2.5921383874196815},{"n0":[1,1],"nf":[2,0],"weight":-2.438292678759993},{"n0":[1,1],"nf":[2,1],"weight":2.8063251377616543},{"n0":[1,1],"nf":[2,2],"weight":-5.065396210015049},{"n0":[1,1],"nf":[2,3],"weight":-3.243042335136095},{"n0":[1,1],"nf":[2,4],"weight":2.542395895887639},{"n0":[1,2],"nf":[2,0],"weight":5.404030554604219},{"n0":[1,2],"nf":[2,1],"weight":1.7863015498992876},{"n0":[1,2],"nf":[2,2],"weight":1.0784128587386383},{"n0":[1,2],"nf":[2,3],"weight":3.923879311898695},{"n0":[1,2],"nf":[2,4],"weight":-5.862725941349154},{"n0":[1,3],"nf":[2,0],"weight":4.361572850233568},{"n0":[1,3],"nf":[2,1],"weight":-3.794297602180668},{"n0":[1,3],"nf":[2,2],"weight":-4.306628432557914},{"n0":[1,3],"nf":[2,3],"weight":1.8299769906529855},{"n0":[1,3],"nf":[2,4],"weight":3.84025797153971},{"n0":[1,4],"nf":[2,0],"weight":-3.2400189683428624},{"n0":[1,4],"nf":[2,1],"weight":4.547306298242339},{"n0":[1,4],"nf":[2,2],"weight":-4.903641978578267},{"n0":[1,4],"nf":[2,3],"weight":-3.434543827170914},{"n0":[1,4],"nf":[2,4],"weight":2.5852132299496007},{"n0":[2,0],"nf":[3,0],"weight":-4.24959667054963},{"n0":[2,0],"nf":[3,1],"weight":-3.493229143121218},{"n0":[2,1],"nf":[3,0],"weight":4.084128926311857},{"n0":[2,1],"nf":[3,1],"weight":-4.232014075010303},{"n0":[2,2],"nf":[3,0],"weight":4.552325217373535},{"n0":[2,2],"nf":[3,1],"weight":2.5580329005701867},{"n0":[2,3],"nf":[3,0],"weight":2.314900339470761},{"n0":[2,3],"nf":[3,1],"weight":1.7506827877945348},{"n0":[2,4],"nf":[3,0],"weight":4.423538736207089},{"n0":[2,4],"nf":[3,1],"weight":3.5987701319112593},{"n0":[3,0],"nf":[4,0],"weight":0.7493929815769563},{"n0":[3,1],"nf":[4,0],"weight":-3.9177235746869705}]}}
},{}],6:[function(require,module,exports){
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
},{"./App":1,"./data":5}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
module.exports = {
  Color: require("./Color"),
  svg: require("./svg")
};
},{"./Color":7,"./svg":9}],9:[function(require,module,exports){
const svg = {};

svg.createElement = function(element) {
  return document.createElementNS("http://www.w3.org/2000/svg", element);
}

module.exports = svg;

},{}],10:[function(require,module,exports){
const nn = require("./nn");

module.exports = {
  ui: require("./ui"),
  common: require("./common"),
  nn: nn,
  Sequential: nn.Sequential
};
},{"./common":8,"./nn":16,"./ui":21}],11:[function(require,module,exports){
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

  backward(args = {}) {
    const links = [];
    
    this.outputNeuronGroup.neurons.forEach(neuron => {
      neuron.backward(args);
      neuron.inputLinks.forEach((link) => {
        links.push(link);
      });
    });

    links.forEach(link => {
      link.backward(args);
    });
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
      neuron.inputLinks.forEach(link => {
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
      neuron.inputLinks.forEach(link => {
        wi.push(link.weightGrad);
      });      
    });

    return w;
  }

  setWeightFromArray(arr) {
    this.inputNeuronGroup.neurons.forEach((inputNeuron, j) => {
      inputNeuron.outputLinks.forEach((link, i) => {
        link.weight = arr[i][j];
      });
    });
  }
}

module.exports = Layer;
},{}],12:[function(require,module,exports){
class Link {
  constructor(neuralNet, n0, nf, weight) {
    this.neuralNet = neuralNet;

    this.n0 = n0;
    this.nf = nf;
    
    if (this.n0.group.id + 1 != this.nf.group.id) {
      throw new Error("Cannot connect neurons from non-consecutive groups");
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
    this.weightGrad += this.n0.activation * this.nf.preActivationGrad;
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
      this.n0.group.id,
      this.n0.id
    ];
    data.nf = [
      this.nf.group.id,
      this.nf.id
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

},{"../common/Color":7,"../common/svg":9}],13:[function(require,module,exports){
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
  constructor(group, id, bias) {
    this.group = group;
    this.id = id;

    this.outputLinks = [];
    this.inputLinks = [];

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
    this.inputLinks.forEach((link) => {
      this.preActivation += link.weight * link.n0.activation;
    });
    this.activation = sigmoid(this.preActivation);
  }

  backward(args = {}) {
    this.outputLinks.forEach((link) => {
      this.activationGrad += link.weight * link.nf.preActivationGrad;
    });
    
    this.preActivationGrad += sigmoidBackward(this.preActivation, this.activationGrad);
    this.biasGrad += this.preActivationGrad;
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

    const isInput = this.inputLinks.length == 0;
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

  getPosition() {
    const model = this.group.parent;
    const numNeurons = this.group.numNeurons();
    const numNeuronGroups = model.numNeuronGroups();
    const maxNumNeuronsPerGroup = model.maxNumNeuronsPerGroup;
    
    const width = model.width;
    const height = model.height;
    
    const cy = height / 2;
    const cx = width / 2;
    
    const dx = (width - (radius + strokeWidth) * 2) / (numNeuronGroups - 1);
    const dy = (height - (radius + strokeWidth) * 2) / (maxNumNeuronsPerGroup - 1);
    
    const x = cx + (this.group.id - (numNeuronGroups - 1) / 2) * dx;
    
    let y;
    if (numNeurons == 0) {
      y = cy;
    } else {
      y = cy + (this.id - (numNeurons - 1) / 2) * dy;
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

},{"../common/Color":7,"../common/svg":9}],14:[function(require,module,exports){
const Neuron = require("./Neuron");

class NeuronGroup {
  constructor(parent, id) {
    this.parent = parent;
    this.id = id;
    this.neurons = [];

    this.headless = parent.headless;
  }
  
  render() {
    this.neurons.forEach((neuron) => {
      neuron.render();
    });
  }

  addNeuron(bias) {
    const model = this.parent;
    if (bias == null) bias = 0.5;
    const id = this.numNeurons();
    const neuron = new Neuron(this, id, bias);
    this.neurons.push(neuron);
    model.neurons.push(neuron);
    if (!this.headless) {
      model.svgNeurons.appendChild(neuron.svgElement);
    }
    if (this.numNeurons() > model.maxNumNeuronsPerGroup) {
      model.maxNumNeuronsPerGroup = this.numNeurons();
    }
    return neuron;
  }

  numNeurons() {
    return this.neurons.length;
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

  static fromData(model, data) {
    const neuronGroup = model.addNeuronGroup();
    data.neurons.forEach((neuronData) => {
      Neuron.fromData(neuronGroup, neuronData);
    });
  }
}

module.exports = NeuronGroup;

},{"./Neuron":13}],15:[function(require,module,exports){
const Link = require("./Link");
const NeuronGroup = require("./NeuronGroup");
const Layer = require("./Layer");

class Sequential {
  constructor(args = {}) {
    this.neurons = [];
    this.links = [];
    this.neuronGroups = [];
    this.layers = [];
    this.maxNumNeuronsPerGroup = 0;

    const headless = args.headless ?? true;
    this.headless = headless;
    if (!headless) {
      const svg = require("../common/svg");

      this.svgElement = svg.createElement("g");
    
      this.svgLinks = svg.createElement("g");
      this.svgElement.appendChild(this.svgLinks);
      
      this.svgNeurons = svg.createElement("g");
      this.svgElement.appendChild(this.svgNeurons);

      const createDomElement = args.createDomElement ?? false;
      if (createDomElement) {
        const domElement = svg.createElement("svg");
        domElement.appendChild(this.svgElement);
        this.domElement = domElement;
      }

      const width = args.width ?? 300;
      const height = args.height ?? 100;
      this.setRenderSize(width, height);
    }
  }

  setRenderSize(width, height) {
    this.width = width;
    this.height = height;

    if (this.domElement != null) {
      const domElement = this.domElement;
      domElement.style.width = width;
      domElement.style.height = height;
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
    this.maxNumNeuronsPerGroup = 0;
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
    const id = this.numNeuronGroups();
    const group = new NeuronGroup(this, id);
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
    n0.outputLinks.push(link);
    nf.inputLinks.push(link);
    this.links.push(link);
    if (!this.headless) {
      this.svgLinks.appendChild(link.svgElement);
    }
    return link;
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

  forward(x) {
    if (x != null) {
      const inputNeuronGroup = this.getInputNeuronGroup();
      const inputNeurons = inputNeuronGroup.neurons;
      if (x.length != inputNeurons.length) {
        throw new Error(`invalid input size, expected ${inputNeuronGroup.length}, found ${x.length}`);
      }
      inputNeurons.forEach((neuron, i) => {
        neuron.activation = x[i];
      });
    }

    for (let i = 1; i < this.neuronGroups.length; i++) {
      const group = this.neuronGroups[i];
      group.neurons.forEach((neuron) => {
        neuron.forward();
      });
    }

    if (x != null) {
      const outputNeuronGroup = this.getOutputNeuronGroup();
      return outputNeuronGroup.neurons.map(n => n.activation);
    }
  }

  backward(args = {}) {
    for (let i = this.numLayers() - 1; i >= 0; i--) {
      const layer = this.layers[i];
      layer.backward(args);
    }
  }

  forwardData(input, target, ctx) {
    const output = this.forward(input);
    const d = target - output;
    ctx.d = d;
    return 0.5 * d * d;
  }

  backwardData(ctx) {
    const outputNeuron = this.getOutputNeuronGroup().neurons[0];
    outputNeuron.activationGrad = -ctx.d;
    this.backward();
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
    const dataPoints = args.dataPoints;
    if (dataPoints == null) throw new Error("dataPoints required");
    const lr = args.lr;
    if (lr == null) throw new Error("lr required");
    const regularization = args.regularization ?? 0.0;
    const iters = args.iters ?? 1;

    let regularizationLoss, dataLoss;

    for (let i = 0; i < iters; i++) {
      dataLoss = 0;
      // TODO batch mode?
      dataPoints.forEach((dataPoint) => {
        const input = [dataPoint.x, dataPoint.y];
        const target = dataPoint.label;
        const dataCtx = {};
        dataLoss += this.forwardData(input, target, dataCtx);
        this.zeroGrad();
        this.backwardData(dataCtx);
        this.optimStep(lr);
      });

      regularizationLoss = this.forwardRegularization({
        regularization: regularization
      });
      this.zeroGrad();
      this.backwardRegularization({
        regularization: regularization
      });
      this.optimStep(lr);
    }

    return {
      dataLoss: dataLoss,
      regularizationLoss: regularizationLoss
    }
  }

  render() {
    this.neuronGroups.forEach((group) => group.render());
    this.links.forEach((link) => link.render());
  }

  toData() {
    return {
      neuronGroups: this.neuronGroups.map((group) => group.toData()),
      links: this.links.map((link) => link.toData())
    }
  }

  loadData(data) {
    this.clear();

    data.neuronGroups.forEach((groupData) => {
      NeuronGroup.fromData(this, groupData);
    });

    for (let i = 1; i < this.numNeuronGroups(); i++) {
      const inputNeuronGroup = this.neuronGroups[i - 1];
      const outputNeuronGroup = this.neuronGroups[i];
      const layer = new Layer({
        inputNeuronGroup: inputNeuronGroup,
        outputNeuronGroup: outputNeuronGroup
      });
      this.layers.push(layer);
    }
  
    data.links.forEach((linkData) => {
      Link.fromData(this, linkData);
    });
  }

  static fromData(data, args = {}) {
    if (data == null) {
      throw new Error("data required");
    }
    const sequential = new Sequential(args);    
    sequential.loadData(data);    
    return sequential;
  }
}

module.exports = Sequential;

},{"../common/svg":9,"./Layer":11,"./Link":12,"./NeuronGroup":14}],16:[function(require,module,exports){
module.exports = {
  Sequential: require("./Sequential")
};
},{"./Sequential":15}],17:[function(require,module,exports){
const Color = require("../common/Color");
const DataPoint = require("./DataPoint");
const DragBehavior = require("./DragBehavior");

class DataCanvas {
  constructor(args = {}) {
    const headless = this.headless = args.headless ?? false;

    if (!headless) {
      const canvas = this.domElement = document.createElement("canvas");
      canvas.width = args.domWidth ?? 250;
      canvas.height = args.domHeight ?? 250;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      this.ctx = ctx;

      this.dragBehavior = new DragBehavior(canvas);
      this.dragBehavior.processDragBegin = this.processDragBegin.bind(this);
      this.dragBehavior.processDragProgress = this.processDragProgress.bind(this);
    }

    this.dataWidth = args.dataWidth ?? 50;
    this.dataHeight = args.dataHeight ?? 50;
    
    this.dataPoints = [];
    this.clearPixels();

    this.xyToPixel = (x, y) => {
      return 0.5;
    }
  }

  clearPixels() {
    this.pixels = [];
    for (let i = 0; i < this.dataWidth; i++) {
      this.pixels.push([]);
      for (let j = 0; j < this.dataHeight; j++) {
        this.pixels[i].push(0);
      }
    }
  }

  updatePixels() {
    const width = this.dataWidth;
    const height = this.dataHeight;
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        const p = this.xyToPixel(i / (width - 1), j / (height - 1));
        if (p < 0 || p > 1) {
          throw new Error(`pixel value must be between 0 and 1, found ${p}`);
        }
        this.pixels[i][j] = p;
      }
    }
  }

  flushPixels() {
    const canvas = this.domElement;
    const ctx = this.ctx;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const dataWidth = this.dataWidth;
    const dataHeight = this.dataHeight;

    const fWidth = canvasWidth / dataWidth;
    const fHeight = canvasHeight / dataHeight;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const canvasImageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const numPixels = canvasImageData.data.length / 4;

    for (let i = 0; i < numPixels; i++) {
      const x = i % canvasWidth;
      const y = Math.floor(i / canvasWidth);
      
      const dataX = Math.floor(x / fWidth);
      const dataY = Math.floor(y / fHeight);

      const p = this.pixels[dataX][dataY];
      const color = Color.lightRed.blend(Color.lightBlue, p);
      const offset = 4 * i;
      canvasImageData.data[offset    ] = Math.round(color.r * 255);
      canvasImageData.data[offset + 1] = Math.round(color.g * 255);
      canvasImageData.data[offset + 2] = Math.round(color.b * 255);
      canvasImageData.data[offset + 3] = 255;
    }
    
    ctx.putImageData(canvasImageData, 0, 0);
  }

  addDataPoint(x, y, label) {
    const dataPoint = new DataPoint(this, x, y, label);
    this.dataPoints.push(dataPoint);
    return dataPoint;
  }

  clear() {
    this.dataPoints = [];
  }

  render() {
    this.updatePixels();
    this.flushPixels(); 
    this.dataPoints.forEach((dataPoint) => dataPoint.render());
  }

  processDragBegin(event) {
    for (let i = 0; i < this.dataPoints.length; i++) {
      const dataPoint = this.dataPoints[i];

      const dx = event.cursor.x - dataPoint.x * this.domElement.width;
      const dy = event.cursor.y - dataPoint.y * this.domElement.height;

      const radius = dataPoint.radius;
      const selectionRadius = radius * 1.5;

      if (dx * dx + dy * dy <= selectionRadius * selectionRadius) {
        const dragState = this.dragBehavior.dragState = {};
        dragState.dataPoint = dataPoint;
        dragState.offset = { x: dx, y: dy };
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

},{"../common/Color":7,"./DataPoint":18,"./DragBehavior":19}],18:[function(require,module,exports){
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
},{"../common/Color":7}],19:[function(require,module,exports){
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
},{}],20:[function(require,module,exports){
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
},{}],21:[function(require,module,exports){
module.exports = {
  DataCanvas: require("./DataCanvas"),
  LossPlot: require("./LossPlot")
};
},{"./DataCanvas":17,"./LossPlot":20}]},{},[6]);
