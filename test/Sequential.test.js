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
  expect(model.inputNeuronGroup).toBe(g0);
  expect(model.outputNeuronGroup).toBe(g0);  

  expect(() => { model.addFullyConnectedLayer(); }).toThrow();

  const layer0 = model.addFullyConnectedLayer(3);
  expect(model.layers[0]).toBe(layer0);
  expect(model.numNeuronGroups()).toBe(2);
  expect(model.numLayers()).toBe(1);
  expect(model.numNeurons()).toBe(5);
  expect(model.numLinks()).toBe(6);
  expect(model.inputNeuronGroup).toBe(g0);
  expect(layer0.inputNeuronGroup).toBe(g0);
  expect(layer0.outputNeuronGroup).toBe(model.outputNeuronGroup);

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