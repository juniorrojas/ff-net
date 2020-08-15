const Neuron = require("./Neuron");

class Layer {
  constructor(parent) {
    this.parent = parent;
    this.neurons = [];
  }

  render() {
    this.neurons.forEach((neuron) => {
      neuron.render();
    });
  }

  reset() {
    for (let i = 0; i < this.neurons.length; i++) {
      const neuron = this.neurons[i];
      neuron.reset();
    }
  }

  addNeuron(bias) {
    if (bias == null) bias = 0.5;
    const neuron = new Neuron(this, bias);
    this.neurons.push(neuron);
    this.parent.neurons.push(neuron);
    this.parent.svgNeurons.appendChild(neuron.svgElement);
    return neuron;
  }

  getNeuronAt(i) {
    return this.neurons[i];
  }

  getNeuronCount() {
    return this.neurons.length;
  }

  getIndex() {
    return this.parent.layers.indexOf(this);
  }

  toData() {
    const data = {
      neurons: this.neurons.map((neuron) => neuron.toData())
    };
    return data;
  }
}

Layer.fromData = function(neuralNet, data) {
	const layer = neuralNet.addLayer();
	for (let i = 0; i < data.neurons.length; i++) {
		const neuronData = data.neurons[i];
		Neuron.fromData(layer, neuronData);
	}
	return layer;
}

module.exports = Layer;
