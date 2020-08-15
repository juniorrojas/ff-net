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

    this.isInput = false; // TODO determine based on links
    this.isOutput = false; // TODO determine based on links

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
    
    const maxVisibleBias = 3;
    let bias = this.bias;
    if (bias < -maxVisibleBias) bias = -maxVisibleBias;
    else if (bias > maxVisibleBias) bias = maxVisibleBias;
    const tFillColor = (bias / maxVisibleBias + 1) * 0.5;
    const fillColor = Color.RED.blend(Color.BLUE, tFillColor);
    const strokeColor = fillColor.blend(Color.BLACK, 0.3);
    
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
