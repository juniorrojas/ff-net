const ffnet = require("ff-net");
const { toBeCloseToArray } = require("./utils");
expect.extend({ toBeCloseToArray });

test("forward", () => {
  const model = new ffnet.Sequential();
  model.addNeuronGroup(2);
  const l0 = model.addFullyConnectedLayer(3);
  const l1 = model.addFullyConnectedLayer(2);
  const y = model.forward([0.2, 0.3]);
  expect(y).not.toBeUndefined();
  expect(y).toBeCloseToArray([0.4867, 0.4025]);
});