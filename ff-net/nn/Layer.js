class Layer {
  constructor(args = {}) {
    this.inputNeuronGroup = args.inputNeuronGroup;
    this.outputNeuronGroup = args.outputNeuronGroup;
  }
}

module.exports = Layer;