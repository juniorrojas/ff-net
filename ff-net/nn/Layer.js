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
}

module.exports = Layer;