const ffnet = require("ff-net");

test("single input and single output", () => {
  const model = new ffnet.Sequential({
    headless: true
  });
  expect(model.numLayers()).toBe(0);
  model.addNeuronGroup(1);
  expect(model.numLayers()).toBe(0);
  model.addFullyConnectedLayer(1);
  expect(model.numLayers()).toBe(1);

  const inputNeuronGroup = model.getInputNeuronGroup();
  const inputNeuron = inputNeuronGroup.neurons[0];
  inputNeuron.activation = 0;
  const outputNeuronGroup = model.getOutputNeuronGroup();
  const outputNeuron = outputNeuronGroup.neurons[0];
  outputNeuron.bias = 0;

  model.forward();
  
  // sigmoid(0) = 0.5
  expect(outputNeuron.activation).toEqual(0.5);
});


test("set activations", () => {
  const model = new ffnet.Sequential({
    headless: true
  });
  const g = model.addNeuronGroup(3);
  g.setActivations([123, 456, 789]);
  expect(g.neurons[0].activation).toBe(123);
  expect(g.neurons[1].activation).toBe(456);
  expect(g.neurons[2].activation).toBe(789);
  expect(g.getActivations()).toEqual([123, 456, 789]);
});