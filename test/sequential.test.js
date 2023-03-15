const ffnet = require("ff-net");

test("add layers", () => {
  const model = new ffnet.Sequential({
    headless: true
  });
  expect(model.numNeurons()).toBe(0);
  expect(model.numLayers()).toBe(0);

  model.addNeuronGroup(2);
  expect(model.numNeurons()).toBe(2);
  expect(model.numLayers()).toBe(0);

  model.addFullyConnectedLayer(3);
  expect(model.numNeurons()).toBe(5);
  expect(model.numLayers()).toBe(1);
});