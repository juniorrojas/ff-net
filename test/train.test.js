const ffnet = require("ff-net");

test("train", () => {
  const model = new ffnet.Sequential();
  model.addNeuronGroup(2);
  model.addFullyConnectedLayer(3);
  model.addFullyConnectedLayer(1);

  expect(() => { model.train() }).toThrow();

  const dataPoints = [
    { x: 0.5, y: 0.2, label: 0 },
    { x: 0.5, y: 0.1, label: 1 }
  ];

  // TODO improve, this is a hack to get the initial loss without training
  const o0 = model.train({
    lr: 0,
    dataPoints: dataPoints,
    iters: 1,
    regularization: 0
  });
  const loss0 = o0.dataLoss;

  const o1 = model.train({
    lr: 1e-1,
    dataPoints: dataPoints,
    iters: 10,
    regularization: 0
  });
  const loss1 = o1.dataLoss;
  
  expect(loss1).toBeLessThan(loss0);
});