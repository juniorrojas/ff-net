const radius = 12;
const strokeWidth = 2;

function sigmoid(n) {
  return 1 / (1 + Math.exp(-n));
}

function dSigmoid(n) {
  return sigmoid(n) * (1 - sigmoid(n));
}

class Neuron {
  constructor(group, bias) {
    this.group = group;
    this.links = [];
    this.backLinks = [];

    this.bias = bias;
    this.preActivation = 0;
    this.activation = sigmoid(this.bias);

    this.dActivation = 0;
    this.dPreActivation = 0;
    this.dBias = 0;
    
    const headless = group.parent.headless;
    this.headless = headless;
    
    if (!headless) {
      const svg = require("../ui/svg");
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
    const Color = require("../ui/Color");
    
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
    const neuralNet = this.group.parent;
    const neuronCount = this.group.neurons.length;
    const neuronGroupCount = neuralNet.neuronGroups.length;
    const maxNeuronCountPerGroup = 5;
    
    const container = neuralNet.svgElement.parentNode;
    if (container == null) return {x: 0, y: 0};
    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;
    
    const cy = height / 2;
    const cx = width / 2;
    
    const dx = (width - (radius + strokeWidth) * 2) / (neuronGroupCount - 1);
    const dy = (height - (radius + strokeWidth) * 2) / (maxNeuronCountPerGroup - 1);
    
    const x = cx + (this.group.getIndex() - (neuronGroupCount - 1) / 2) * dx;
    
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

  static fromData(group, data) {
    group.addNeuron(data.bias);
  }
}

module.exports = Neuron;
