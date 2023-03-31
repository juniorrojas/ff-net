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

  codegenTorch() {
    const inputSize = this.inputNeuronGroup.numNeurons();
    const outputSize = this.outputNeuronGroup.numNeurons();
    let s = "";
    s += `  nn.Linear(${inputSize}, ${outputSize}),\n`;
    s += `  nn.Sigmoid(),\n`;
    return s;
  }
}

module.exports = Layer;