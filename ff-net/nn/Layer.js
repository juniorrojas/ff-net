class Layer {
  constructor(args = {}) {
    if (args.inputNeuronGroup == null) {
      throw new Error("inputNeuronGroup required to create layer");
    }
    if (args.outputNeuronGroup == null) {
      throw new Error("outputNeuronGroup required to create layer");
    }
    this.inputNeuronGroup = args.inputNeuronGroup;
    this.outputNeuronGroup = args.outputNeuronGroup;
  }

  getBiasArray() {
    const b = [];
    this.outputNeuronGroup.neurons.forEach(neuron => {
      b.push(neuron.bias);
    });
    return b;
  }

  getBiasGradArray() {
    const b = [];
    this.outputNeuronGroup.neurons.forEach(neuron => {
      b.push(neuron.biasGrad);
    });
    return b;
  }

  setBiasFromArray(arr) {
    const outputNeurons = this.outputNeuronGroup.neurons;
    if (arr.length != outputNeurons.length) {
      throw new Error(`invalid bias size, found ${arr.length}, expected ${outputNeurons.length}`);
    }
    outputNeurons.forEach((neuron, i) => {
      neuron.bias = arr[i];
    });
  }

  getWeightArray() {
    const w = [];

    this.outputNeuronGroup.neurons.forEach(neuron => {
      const wi = [];
      w.push(wi);
      neuron.backLinks.forEach(link => {
        wi.push(link.weight);
      });      
    });

    return w;
  }

  getWeightGradArray() {
    const w = [];

    this.outputNeuronGroup.neurons.forEach(neuron => {
      const wi = [];
      w.push(wi);
      neuron.backLinks.forEach(link => {
        wi.push(link.weightGrad);
      });      
    });

    return w;
  }

  setWeightFromArray(arr) {
    this.inputNeuronGroup.neurons.forEach((inputNeuron, j) => {
      inputNeuron.links.forEach((link, i) => {
        link.weight = arr[i][j];
      });
    });
  }
}

module.exports = Layer;