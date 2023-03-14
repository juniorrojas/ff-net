const ffnet = require("ff-net");

test("test", () => {
  const model = new ffnet.nn.Sequential({
    headless: true
  });
  expect(model.numLayers()).toBe(0);
  model.addNeuronGroup(2);
  expect(model.numLayers()).toBe(0);
  model.addFullyConnectedLayer(2);
  // expect(model.numLayers()).toBe(1);
});