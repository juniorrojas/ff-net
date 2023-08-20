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

    let headless = args.headless ?? true;
    const createDomElement = args.createDomElement ?? false;
    if (createDomElement) headless = false;

    this.headless = headless;
    
    if (!headless) {
      const svg = require("../common/svg");

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
    }

    const width = args.width ?? 300;
    const height = args.height ?? 100;
    this.setSize(width, height);
  }

  setSize(width, height) {
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

  get inputNeuronGroup() { return this.getInputNeuronGroup(); }

  getOutputNeuronGroup() {
    if (this.neuronGroups.length == 0) {
      throw new Error("no neuron groups available");
    }
    return this.neuronGroups[this.neuronGroups.length - 1];
  }

  get outputNeuronGroup() { return this.getOutputNeuronGroup(); }

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
      group.forward();
    }

    if (x != null) {
      const outputNeuronGroup = this.getOutputNeuronGroup();
      return outputNeuronGroup.getActivations();
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
