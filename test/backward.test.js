const ffnet = require("ff-net");

test("single layer backward", () => {
  const model = new ffnet.Sequential({
    headless: true
  });
  expect(model.numLayers()).toBe(0);
  model.addNeuronGroup(1);
  expect(model.numLayers()).toBe(0);
  model.addFullyConnectedLayer(1);
  expect(model.numLayers()).toBe(1);
  expect(model.numLinks()).toBe(1);

  const inputNeuronGroup = model.getInputNeuronGroup();
  const inputNeuron = inputNeuronGroup.neurons[0];
  const outputNeuronGroup = model.getOutputNeuronGroup();
  const outputNeuron = outputNeuronGroup.neurons[0];
  const link = model.links[0];

  // f(x) = sigmoid(x * w + b)

  const x = 0.0;
  const w = 1.0;
  const b = 0.0;

  inputNeuron.activation = x;
  outputNeuron.bias = b;
  link.weight = w;

  // forward
  model.forward();
  
  expect(outputNeuron.activation).toBe(0.5);

  // backward
  outputNeuron.activationGrad = 1;
  model.backward();

  expect(outputNeuron.preActivationGrad).toBe(0.25);
  expect(link.weightGrad).toBe(0);
  expect(outputNeuron.biasGrad).toBe(0.25);
});

test("backward", () => {
  const model = new nn.Sequential({
    headless: true
  });
});