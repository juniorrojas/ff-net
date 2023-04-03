const ffnet = require("ff-net");
const { toBeCloseToArray } = require("./utils");
expect.extend({ toBeCloseToArray });

test("forward", () => {
  const model = new ffnet.Sequential();
  model.addNeuronGroup(2);
  
  const l1 = model.addFullyConnectedLayer(3);
  l1.setWeightFromArray([
    [-0.0053,  0.3793],
    [-0.5820, -0.5204],
    [-0.2723,  0.1896]
  ]);
  l1.setBiasFromArray([-0.0140,  0.5607, -0.0628]);
  
  const l2 = model.addFullyConnectedLayer(2);
  l2.setWeightFromArray([
    [ 0.1528, -0.1745, -0.1135],
    [-0.5516, -0.3824, -0.2380]
  ]);
  l2.setBiasFromArray([0.0214, 0.2282]);

  let y = model.forward();
  expect(y).toBeUndefined();

  y = model.forward([0.2, 0.3]);
  expect(y).not.toBeUndefined();
  expect(y).toBeCloseToArray([0.4867, 0.4025]);

  // invalid input size
  expect(() => { model.forward([0.1, 0.2, 0.3]); }).toThrow();
});