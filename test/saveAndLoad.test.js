const ffnet = require("ff-net");

test("save and load", () => {
  const model = new ffnet.Sequential();
  model.addNeuronGroup(2);
  model.addFullyConnectedLayer(3);
  model.addFullyConnectedLayer(5);

  expect(model.numNeuronGroups()).toBe(3);
  expect(model.numLayers()).toBe(2);

  const data = model.toData();
  const loadedModel = ffnet.Sequential.fromData({
    data: data,
    headless: true
  });

  expect(loadedModel.numNeuronGroups()).toBe(3);
  expect(loadedModel.numLayers()).toBe(2);
});