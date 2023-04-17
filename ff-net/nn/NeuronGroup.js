const Neuron = require("./Neuron");

class NeuronGroup {
  constructor(sequential, id) {
    this.sequential = sequential;
    this.id = id;
    this.neurons = [];

    this.headless = sequential.headless;
  }

  numNeurons() {
    return this.neurons.length;
  }

  addNeuron(bias) {
    const sequential = this.sequential;
    if (bias == null) bias = 0.5;
    const id = this.numNeurons();
    const neuron = new Neuron(this, id, bias);
    this.neurons.push(neuron);
    sequential.neurons.push(neuron);
    if (!this.headless) {
      sequential.svgNeurons.appendChild(neuron.svgElement);
    }
    if (this.numNeurons() > sequential.maxNumNeuronsPerGroup) {
      sequential.maxNumNeuronsPerGroup = this.numNeurons();
    }
    return neuron;
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

  forward() {
    this.neurons.forEach((neuron) => {
      neuron.forward();
    });
  }
  
  render() {
    this.neurons.forEach((neuron) => {
      neuron.render();
    });
  }

  toData() {
    const data = {
      neurons: this.neurons.map((neuron) => neuron.toData())
    };
    return data;
  }  

  static fromData(sequential, data) {
    const neuronGroup = sequential.addNeuronGroup();
    data.neurons.forEach((neuronData) => {
      Neuron.fromData(neuronGroup, neuronData);
    });
  }
}

module.exports = NeuronGroup;
