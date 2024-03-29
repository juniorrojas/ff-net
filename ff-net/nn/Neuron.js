const strokeWidth = 2;

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function sigmoidBackward(x, outputGrad) {
  const s = sigmoid(x);
  return s * (1 - s) * outputGrad;
}

class Neuron {
  constructor(group, id, bias, radius) {
    this.group = group;
    this.id = id;
    this.radius = radius ?? 12;

    this.outputLinks = [];
    this.inputLinks = [];

    this.bias = bias;
    this.preActivation = 0;
    this.activation = sigmoid(this.bias);

    this.zeroGrad();
    
    const headless = group.sequential.headless;
    this.headless = headless;
    
    if (!headless) {
      const svg = require("../common/svg");
      const svgElement = this.svgElement = svg.createElement("g");
      const svgCircle = this.svgCircle = svg.createElement("circle");
      svgElement.appendChild(svgCircle);
      svgCircle.setAttribute("r", this.radius);
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
    
    const circle = this.svgCircle;
    const position = this.getPosition();
    circle.setAttribute("cx", position.x);
    circle.setAttribute("cy", position.y);
    this.svgCircle.setAttribute("r", this.radius);

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
    const sequential = this.group.sequential;
    const numNeurons = this.group.numNeurons();
    const numNeuronGroups = sequential.numNeuronGroups();
    const maxNumNeuronsPerGroup = sequential.maxNumNeuronsPerGroup;
    
    const width = sequential.width;
    const height = sequential.height;
    
    const cy = height / 2;
    const cx = width / 2;

    const radius = this.radius;
    
    let dx;
    if (numNeuronGroups < 2) {
      dx = 0;
    } else {
      dx = (width - (radius + strokeWidth) * 2) / (numNeuronGroups - 1);
    }

    let dy;
    if (maxNumNeuronsPerGroup < 2) {
      dy = 0;
    } else {
      dy = (height - (radius + strokeWidth) * 2) / (maxNumNeuronsPerGroup - 1);
    }
    
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
