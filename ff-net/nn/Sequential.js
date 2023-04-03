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
    // for (let i = this.neuronGroups.length - 1; i >= 0; i--) {
    //   const group = this.neuronGroups[i];
    //   group.neurons.forEach((neuron) => {
    //     neuron.backward(args);
    //   });
    // }
    for (let i = this.numLayers() - 1; i >= 0; i--) {
      const layer = this.layers[i];
      layer.backward();
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
