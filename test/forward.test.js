const ffnet = require("ff-net");

test("forward", () => {
  const model = new ffnet.Sequential();
  model.addNeuronGroup(2);
  model.addFullyConnectedLayer(3);
  const y = model.forward([0.3, 0.8]);
  expect(y).not.toBeUndefined();
  // TODO check value
});