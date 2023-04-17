const Neuron = require("./Neuron");

class NeuronGroup {
  constructor(parent, id) {
    this.parent = parent;
    this.id = id;
    this.neurons = [];

    this.headless = parent.headless;
  }

  numNeurons() {
    return this.neurons.length;
  }

  addNeuron(bias) {
    const model = this.parent;
    if (bias == null) bias = 0.5;
    const id = this.numNeurons();
    const neuron = new Neuron(this, id, bias);
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

  static fromData(model, data) {
    const neuronGroup = model.addNeuronGroup();
    data.neurons.forEach((neuronData) => {
      Neuron.fromData(neuronGroup, neuronData);
    });
  }
}

module.exports = NeuronGroup;
