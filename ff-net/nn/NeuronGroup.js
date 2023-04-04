const Neuron = require("./Neuron");

class NeuronGroup {
  constructor(parent) {
    this.parent = parent;
    this.neurons = [];

    this.headless = parent.headless;
  }
  
  render() {
    this.neurons.forEach((neuron) => {
      neuron.render();
    });
  }

  addNeuron(bias) {
    const model = this.parent;
    if (bias == null) bias = 0.5;
    const neuron = new Neuron(this, bias);
    this.neurons.push(neuron);
    model.neurons.push(neuron);
    if (!this.headless) {
      model.svgNeurons.appendChild(neuron.svgElement);
    }
    if (this.numNeurons() > model.maxNumNeuronsPerGroup) {
      model.maxNumNeuronsPerGroup = this.numNeurons();
    }
    return neuron;
  }

  numNeurons() {
    return this.neurons.length;
  }

  getIndex() {
    return this.parent.neuronGroups.indexOf(this);
  }

  setActivations(arr) {
    const n = this.numNeurons();
    if (arr.length != n) {
      throw new Error(`expected ${n} values, found ${arr.length}`);
    }
    for (let i = 0; i < n; i++) {
      this.neurons[i].activation = arr[i];
    }
  }

  getActivations() {
    return this.neurons.map(neuron => neuron.activation);
  }

  toData() {
    const data = {
      neurons: this.neurons.map((neuron) => neuron.toData())
    };
    return data;
  }

  static fromData(model, data) {
    const neuronGroup = model.addNeuronGroup();
    data.neurons.forEach((neuronData) => {
      Neuron.fromData(neuronGroup, neuronData);
    });
  }
}

module.exports = NeuronGroup;
