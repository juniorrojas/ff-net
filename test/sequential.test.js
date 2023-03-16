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

  const g1 = model.addFullyConnectedLayer(3);
  expect(model.numNeuronGroups()).toBe(2);
  expect(model.numLayers()).toBe(1);
  expect(model.numNeurons()).toBe(5);
  expect(model.numLinks()).toBe(6);
  expect(model.getInputNeuronGroup()).toBe(g0);
  // expect(model.getOutputNeuronGroup()).toBe(g1);

  const g2 = model.addFullyConnectedLayer(5);
  expect(model.numNeuronGroups()).toBe(3);
  expect(model.numLayers()).toBe(2);
  expect(model.numNeurons()).toBe(10);
  expect(model.numLinks()).toBe(21);

  const g3 = model.clear();
  expect(model.numNeuronGroups()).toBe(0);
  expect(model.numLayers()).toBe(0);
  expect(model.numNeurons()).toBe(0);
  expect(model.numLinks()).toBe(0);
});