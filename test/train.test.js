const ffnet = require("ff-net");

test("train", () => {
  const model = new ffnet.Sequential();
  model.addNeuronGroup(2);
  model.addFullyConnectedLayer(3);
  model.addFullyConnectedLayer(1);

  expect(() => { model.train() }).toThrow();
  model.train({
    lr: 1e-2,
    dataPoints: [
      { x: 0.5, y: 0.2, label: 0 },
      { x: 0.5, y: 0.1, label: 1 }
    ]
  });

  // TODO check that loss went down
});