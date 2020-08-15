const svg = require("../common/svg");
const Color = require("../common/Color");

class Link {
  constructor(neuralNet, n0, nf, weight) {
    this.neuralNet = neuralNet;
    this.n0 = n0;
    this.nf = nf;
    
    if (this.n0.layer.getIndex() + 1 != this.nf.layer.getIndex()) {
      throw "Cannot connect neurons from non-consecutive layers";
    }
    
    if (weight == null) this.weight = 1;
    else this.weight = weight;
    this.dWeight = 0;

    this.svgElement = svg.createElement("path");
    this.redraw();
  }

  redraw() {
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
    if (this.weight < 0) color = Color.RED;
    else color = Color.BLUE;
    path.setAttribute("stroke-opacity", 0.4);
    path.setAttribute("stroke", color);
  }

  backward(regularization) {
    let regularizationError = 0;
    this.dWeight = this.n0.activation * this.nf.dPreActivation;
    // regularization error = 0.5 * regularization * weight^2
    this.dWeight += regularization * this.weight;
    regularizationError += 0.5 * regularization * this.weight * this.weight;
    return regularizationError;
  }

  applyGradient(learningRate) {
    this.weight -= learningRate * this.dWeight;
  }

  toData() {
    const data = {};
    data.n0 = [
      this.n0.layer.getIndex(),
      this.n0.getIndex()
    ];
    data.nf = [
      this.nf.layer.getIndex(),
      this.nf.getIndex()
    ];
    data.weight = this.weight;
    return data;
  }
}

Link.fromData = function(neuralNet, data) {
  const weight = data.weight;
  const n0 = neuralNet.layers[data.n0[0]].neurons[data.n0[1]];
  const nf = neuralNet.layers[data.nf[0]].neurons[data.nf[1]];
  const link = neuralNet.addLink(n0, nf, weight);
  return link;
}

module.exports = Link;
