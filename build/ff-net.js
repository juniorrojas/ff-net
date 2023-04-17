(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ffnet = factory());
})(this, (function () { 'use strict';

  const svg = {};

  svg.createElement = function(element) {
    return document.createElementNS("http://www.w3.org/2000/svg", element);
  };

  var svg_1 = svg;

  class Color$2 {
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
      
      return new Color$2(
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

  Color$2.white = new Color$2(1, 1, 1);
  Color$2.black = new Color$2(0, 0, 0);

  Color$2.red = new Color$2(226 / 255, 86 / 255, 86 / 255);
  Color$2.blue = new Color$2(135 / 255, 173 / 255, 236 / 255);

  Color$2.lightBlue = new Color$2(186 / 255, 224 / 255, 251 / 255);
  Color$2.lightRed = new Color$2(252 / 255, 163 / 255, 163 / 255);

  var Color_1 = Color$2;

  class Link$1 {
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
        const svg = svg_1;
        this.svgElement = svg.createElement("path");
        this.render();
      }
    }

    render() {
      const Color = Color_1;

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
      this.weightGrad = 0.0;
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

  var Link_1 = Link$1;

  const radius = 12;
  const strokeWidth = 2;

  function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  function sigmoidBackward(x, outputGrad) {
    const s = sigmoid(x);
    return s * (1 - s) * outputGrad;
  }

  class Neuron$1 {
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
        const svg = svg_1;
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
      const Color = Color_1;
      
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

  var Neuron_1 = Neuron$1;

  const Neuron = Neuron_1;

  class NeuronGroup$1 {
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

  var NeuronGroup_1 = NeuronGroup$1;

  class LayerLinks {
    constructor(layer) {
      this.layer = layer;
    }

    *[Symbol.iterator]() {
      const outputNeurons = this.layer.outputNeuronGroup.neurons;
      for (let i = 0; i < outputNeurons.length; i++) {
        const outputNeuron = outputNeurons[i];
        for (let j = 0; j < outputNeuron.inputLinks.length; j++) {
          yield outputNeuron.inputLinks[j];
        }
      }
    }
  }

  class Layer$1 {
    constructor(args = {}) {
      if (args.inputNeuronGroup == null) {
        throw new Error("inputNeuronGroup required to create layer");
      }
      if (args.outputNeuronGroup == null) {
        throw new Error("outputNeuronGroup required to create layer");
      }
      this.inputNeuronGroup = args.inputNeuronGroup;
      this.outputNeuronGroup = args.outputNeuronGroup;

      this.links = new LayerLinks(this);
    }
    
    backward(args = {}) {
      this.outputNeuronGroup.neurons.forEach(neuron => {
        neuron.backward(args);
      });

      for (let link of this.links) {
        link.backward(args);
      }  }

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

  var Layer_1 = Layer$1;

  const Link = Link_1;
  const NeuronGroup = NeuronGroup_1;
  const Layer = Layer_1;

  class Sequential {
    constructor(args = {}) {
      this.neurons = [];
      this.links = [];
      this.neuronGroups = [];
      this.layers = [];
      this.maxNumNeuronsPerGroup = 0;

      let headless = args.headless ?? true;
      const createDomElement = args.createDomElement ?? false;
      if (createDomElement) headless = false;

      this.headless = headless;
      
      if (!headless) {
        const svg = svg_1;

        this.svgElement = svg.createElement("g");
      
        this.svgLinks = svg.createElement("g");
        this.svgElement.appendChild(this.svgLinks);
        
        this.svgNeurons = svg.createElement("g");
        this.svgElement.appendChild(this.svgNeurons);

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

  var Sequential_1 = Sequential;

  var nn$1 = {
    Sequential: Sequential_1
  };

  const Color$1 = Color_1;

  class DataPoint$1 {
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
      if (this.label == 0) fillColor = Color$1.red;
      else fillColor = Color$1.blue;
      const strokeColor = fillColor.blend(Color$1.black, 0.6);
      
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

  var DataPoint_1 = DataPoint$1;

  class DragBehavior$1 {
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

  var DragBehavior_1 = DragBehavior$1;

  const Color = Color_1;
  const DataPoint = DataPoint_1;
  const DragBehavior = DragBehavior_1;

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
      };
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
      }  }

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

  var DataCanvas_1 = DataCanvas;

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

      const totalLosses = this.data.map((item) => item.totalLoss);
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

  var LossPlot_1 = LossPlot;

  var ui$1 = {
    DataCanvas: DataCanvas_1,
    LossPlot: LossPlot_1
  };

  var common = {
    Color: Color_1,
    svg: svg_1
  };

  const nn = nn$1;
  const ui = ui$1;

  var ffNet = {
    common: common,
    nn: nn,
    ui: ui,
    Sequential: nn.Sequential,
    DataCanvas: ui.DataCanvas
  };

  return ffNet;

}));
