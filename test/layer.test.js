const ffnet = require("ff-net");

test("array utils", () => {
  const model = new ffnet.Sequential();
  model.addNeuronGroup(2);
  const layer = model.addFullyConnectedLayer(3);
  expect(model.numLinks()).toBe(6);
  model.links.forEach((link, i) => {
    link.weight = i;
  });
  expect(layer.getWeightArray()).toEqual([
    [0, 3],
    [1, 4],
    [2, 5]
  ]);
});