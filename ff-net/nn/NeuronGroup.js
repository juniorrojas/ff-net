const Neuron = require("./Neuron");

class NeuronGroup {
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
    return this.parent.neuronGroups.indexOf(this);
  }

  toData() {
    const data = {
      neurons: this.neurons.map((neuron) => neuron.toData())
    };
    return data;
  }

  static fromData(neuralNet, data) {
    const neuronGroup = neuralNet.addNeuronGroup();
    data.neurons.forEach((neuronData) => {
      Neuron.fromData(neuronGroup, neuronData);
    });
  }
}

module.exports = NeuronGroup;
