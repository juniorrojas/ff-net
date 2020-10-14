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
