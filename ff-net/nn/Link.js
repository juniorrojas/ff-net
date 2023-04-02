class Link {
  constructor(neuralNet, n0, nf, weight) {
    this.neuralNet = neuralNet;

    this.n0 = n0;
    this.nf = nf;
    
    if (this.n0.group.getIndex() + 1 != this.nf.group.getIndex()) {
      throw "Cannot connect neurons from non-consecutive groups";
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

  backward(regularization) {
    let regularizationError = 0;
    this.weightGrad = this.n0.activation * this.nf.preActivationGrad;
    // regularization error = 0.5 * regularization * weight^2
    this.weightGrad += regularization * this.weight;
    regularizationError += 0.5 * regularization * this.weight * this.weight;
    return regularizationError;
  }

  optimStep(lr) {
    this.weight -= lr * this.weightGrad;
  }

  toData() {
    const data = {};
    data.n0 = [
      this.n0.group.getIndex(),
      this.n0.getIndex()
    ];
    data.nf = [
      this.nf.group.getIndex(),
      this.nf.getIndex()
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
