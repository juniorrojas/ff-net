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

  addLayer(neuronCount) {
    if (neuronCount == null) neuronCount = 0;	
    
    var layer = new Layer(this);
    this.layers.push(layer);
    
    for (var i = 0; i < neuronCount; i++) {
      var neuron = layer.addNeuron();
    }
    
    return layer;
  }

  addFullyConnectedLayer(neuronCount) {
    var l0 = this.layers[this.layers.length - 1];
    this.addLayer(neuronCount);
    var lf = this.layers[this.layers.length - 1];
    for (var i = 0; i < l0.neurons.length; i++) {
      var n0 = l0.neurons[i];
      for (var j = 0; j < lf.neurons.length; j++) {
        var nf = lf.neurons[j];
        this.addLink(n0, nf);
      }
    }
  }

  addLink(n0, nf, weight) {
    var link = new Link(this, n0, nf, weight);
    n0.links.push(link);
    nf.backLinks.push(link);
    this.links.push(link);
    this.svgLinks.appendChild(link.svgElement);
    return link;
  }

  render() {
    for (var i = 0; i < this.layers.length; i++) {
      var layer = this.layers[i];
      layer.render();
    }
    for (var i = 0; i < this.links.length; i++) {
      var link = this.links[i];
      link.redraw();
    }
  }

  reset(input) {
    for (var i = 0; i < this.layers.length; i++) {
      var layer = this.layers[i];
      layer.reset();
    }
  }

  randomizeParameters() {
    for (var i = 0; i < this.links.length; i++) {
      var link = this.links[i];
      var weight = 2 + Math.random() * 4;
      if (Math.random() <= 0.5) weight *= -1;
      link.weight = weight;
    }
    
    for (var i = 0; i < this.neurons.length; i++) {
      var neuron = this.neurons[i];
      var bias = 1 + Math.random() * 2;
      if (Math.random() <= 0.5) bias *= -1;
      neuron.bias = bias;
    }
  }

  forward(input) {
    for (var i = 1; i < this.layers.length; i++) {
      var layer = this.layers[i];
      for (var j = 0; j < layer.neurons.length; j++) {
        var neuron = layer.neurons[j];
        neuron.forward();
      }
    }
  }

  backward(learningRate, regularization) {
    let regularizationError = 0;
    
    for (var i = this.layers.length - 1; i >= 0; i--) {
      var layer = this.layers[i];
      for (var j = 0; j < layer.neurons.length; j++) {
        var neuron = layer.neurons[j];
        regularizationError += neuron.backward(regularization);
      }
    }
    
    this.applyGradient(learningRate);
    
    return regularizationError;
  }

  applyGradient(learningRate) {
    for (var i = 0; i < this.links.length; i++) {
      var link = this.links[i];
      link.applyGradient(learningRate);
    }
    
    for (var i = 1; i < this.layers.length; i++) {
      var layer = this.layers[i];
      for (var j = 0; j < layer.neurons.length; j++) {
        var neuron = layer.neurons[j];
        neuron.applyGradient(learningRate);
      }
    }
  }

  toData() {
    var data = {};
    
    data.layers = [];
    for (var i = 0; i < this.layers.length; i++) {
      var layer = this.layers[i];
      data.layers.push(layer.toData());
    }
    
    data.links = [];
    for (var i = 0; i < this.links.length; i++) {
      var link = this.links[i];
      data.links.push(link.toData());
    }
    
    return data;
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
