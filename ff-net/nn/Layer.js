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
    const inputSize = this.inputNeuronGroup.numNeurons();
    const outputSize = this.outputNeuronGroup.numNeurons();

    const w = [];
    for (let i = 0; i < outputSize; i++) {
      const dstNeuron = this.outputNeuronGroup.neurons[i];
      const wi = [];
      w.push(wi);
      for (let j = 0; j < inputSize; j++) {
        const srcNeuron = this.inputNeuronGroup.neurons[j];
        const link = srcNeuron.getLinkToNeuron(dstNeuron);
        if (link == null) {
          throw new Error("link not found");
        }
        wi.push(link.weight);
      }
    }

    return w;
  }

  getWeightGradArray() {
    const inputSize = this.inputNeuronGroup.numNeurons();
    const outputSize = this.outputNeuronGroup.numNeurons();

    const w = [];
    for (let i = 0; i < outputSize; i++) {
      const dstNeuron = this.outputNeuronGroup.neurons[i];
      const wi = [];
      w.push(wi);
      for (let j = 0; j < inputSize; j++) {
        const srcNeuron = this.inputNeuronGroup.neurons[j];
        const link = srcNeuron.getLinkToNeuron(dstNeuron);
        if (link == null) {
          throw new Error("link not found");
        }
        wi.push(link.weightGrad);
      }
    }

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