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
    const x = this.n0.activation;
    const outputGrad = this.nf.preActivationGrad;
    this.n0.activationGrad += outputGrad * this.weight;
    this.weightGrad += outputGrad * x;
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
