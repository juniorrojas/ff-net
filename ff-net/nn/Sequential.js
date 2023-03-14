const Link = require("./Link");
const NeuronGroup = require("./NeuronGroup");

class Sequential {
  constructor(args = {}) {
    this.neurons = [];
    this.links = [];
    this.neuronGroups = [];

    this.headless = args.headless ?? true;
    if (!this.headless) {
      const svg = require("../common/svg");

      this.svgElement = svg.createElement("g");
    
      this.svgLinks = svg.createElement("g");
      this.svgElement.appendChild(this.svgLinks);
      
      this.svgNeurons = svg.createElement("g");
      this.svgElement.appendChild(this.svgNeurons);
    }
  }

  numLayers() {
    return Math.max(0, this.neuronGroups.length - 1);
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
    const inputGroup = this.neuronGroups[this.neuronGroups.length - 1];
    this.addNeuronGroup(neurons);
    const outputGroup = this.neuronGroups[this.neuronGroups.length - 1];
    inputGroup.neurons.forEach((inputNeuron) => {
      outputGroup.neurons.forEach((outputNeuron) => {
        this.addLink(inputNeuron, outputNeuron);
      })
    });
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

  reset() {
    this.neuronGroups.forEach((group) => group.reset());
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

  backward(learningRate, regularization) {
    let regularizationLoss = 0;
    
    for (let i = this.neuronGroups.length - 1; i >= 0; i--) {
      const group = this.neuronGroups[i];
      group.neurons.forEach((neuron) => {
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
    
    for (let i = 1; i < this.neuronGroups.length; i++) {
      const group = this.neuronGroups[i];
      group.neurons.forEach((neuron) => {
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
        this.neuronGroups[0].neurons[0].activation = dataPoint.x;
        this.neuronGroups[0].neurons[1].activation = dataPoint.y;
        this.forward();
        
        const neuron = this.neuronGroups[this.neuronGroups.length - 1].neurons[0];
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
      groups: this.neuronGroups.map((group) => group.toData()),
      links: this.links.map((link) => link.toData())
    }
  }

  static fromData(args = {}) {
    const data = args.data;
    const headless = args.headless;

    const sequential = new Sequential({
      headless: headless
    });
    
    data.neuronGroups.forEach((groupData) => {
      NeuronGroup.fromData(sequential, groupData);
    });
  
    data.links.forEach((linkData) => {
      Link.fromData(sequential, linkData);
    });
    
    return sequential;
  }
}

module.exports = Sequential;
