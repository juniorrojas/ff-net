const ffnet = require("ff-net");

test("add layers", () => {
  const model = new ffnet.Sequential({
    headless: true
  });
  expect(model.numNeuronGroups()).toBe(0);
  expect(model.numLayers()).toBe(0);
  expect(model.numNeurons()).toBe(0);
  expect(model.numLinks()).toBe(0);

  const g0 = model.addNeuronGroup(2);
  expect(model.numNeuronGroups()).toBe(1);
  expect(model.numLayers()).toBe(0);
  expect(model.numNeurons()).toBe(2);
  expect(model.numLinks()).toBe(0);
  expect(model.getInputNeuronGroup()).toBe(g0);
  expect(model.getOutputNeuronGroup()).toBe(g0);  

  expect(() => { model.addFullyConnectedLayer(); }).toThrow();

  const layer0 = model.addFullyConnectedLayer(3);
  expect(model.layers[0]).toBe(layer0);
  expect(model.numNeuronGroups()).toBe(2);
  expect(model.numLayers()).toBe(1);
  expect(model.numNeurons()).toBe(5);
  expect(model.numLinks()).toBe(6);
  expect(model.getInputNeuronGroup()).toBe(g0);
  expect(layer0.inputNeuronGroup).toBe(g0);
  expect(layer0.outputNeuronGroup).toBe(model.getOutputNeuronGroup());

  const layer1 = model.addFullyConnectedLayer(5);
  expect(model.layers[1]).toBe(layer1);
  expect(model.numNeuronGroups()).toBe(3);
  expect(model.numLayers()).toBe(2);
  expect(model.numNeurons()).toBe(10);
  expect(model.numLinks()).toBe(21);

  model.clear();
  expect(model.numNeuronGroups()).toBe(0);
  expect(model.numLayers()).toBe(0);
  expect(model.numNeurons()).toBe(0);
  expect(model.numLinks()).toBe(0);
});

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