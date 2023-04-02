const ffnet = require("ff-net");

test("regularization", () => {
  const model = new ffnet.Sequential();
  model.addNeuronGroup(3);
  
  let r;
  r = model.forwardRegularization();
  expect(r).toBe(0);
  
  const layer = model.addFullyConnectedLayer(2);
  model.links.forEach(link => {
    link.weight = 1.0;
  });

  r = model.forwardRegularization({ regularization: 2.0 });
  expect(r).toBe(6);

  model.links.forEach(link => {
    expect(link.weightGrad).toBe(0.0);
  });
  model.backwardRegularization({ regularization: 2.0 });
  model.links.forEach(link => {
    expect(link.weightGrad).toBe(2.0);
  });
});