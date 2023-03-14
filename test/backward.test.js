const ffnet = require("ff-net");

test("backward", () => {
  const model = new ffnet.Sequential({
    headless: true
  });
  expect(model.numLayers()).toBe(0);
  model.addNeuronGroup(1);
  expect(model.numLayers()).toBe(0);
  model.addFullyConnectedLayer(1);
  expect(model.numLayers()).toBe(1);
  expect(model.numLinks()).toBe(1);

  // f(x) = sigmoid(x * w + b)
  const x = 0.0;
  const w = 1.0;
  const b = 0.0;

  const inputNeuronGroup = model.getInputNeuronGroup();
  const inputNeuron = inputNeuronGroup.neurons[0];
  inputNeuron.activation = x;
  const outputNeuronGroup = model.getOutputNeuronGroup();
  const outputNeuron = outputNeuronGroup.neurons[0];
  outputNeuron.bias = b;
  model.links[0].weight = w;

  model.forward();
  
  expect(outputNeuron.activation).toEqual(0.5);

  model.backward(0, 0);
  // TODO check that w.grad and b.grad are correct
});