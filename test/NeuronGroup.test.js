const ffnet = require("ff-net");

test("set activations", () => {
  const model = new ffnet.Sequential({
    headless: true
  });
  const g = model.addNeuronGroup(3);
  g.setActivations([123, 456, 789]);
  expect(g.neurons[0].activation).toBe(123);
  expect(g.neurons[1].activation).toBe(456);
  expect(g.neurons[2].activation).toBe(789);
  expect(g.getActivations()).toEqual([123, 456, 789]);
});

test("max neurons per group", () => {
  const model = new ffnet.Sequential({
    headless: true
  });
  expect(model.maxNumNeuronsPerGroup).toBe(0);
  model.addNeuronGroup(3);
  expect(model.maxNumNeuronsPerGroup).toBe(3);
  model.addNeuronGroup(2);
  expect(model.maxNumNeuronsPerGroup).toBe(3);
  model.addNeuronGroup(10);
  expect(model.maxNumNeuronsPerGroup).toBe(10);
  model.addNeuronGroup(1);
  expect(model.maxNumNeuronsPerGroup).toBe(10);

  const model2 = ffnet.Sequential.fromData(model.toData(), { headless: true });
  expect(model2.maxNumNeuronsPerGroup).toBe(10);

  model2.addNeuronGroup(1)
  expect(model2.maxNumNeuronsPerGroup).toBe(10);
  model2.addNeuronGroup(12)
  expect(model2.maxNumNeuronsPerGroup).toBe(12);
  model2.clear();
  expect(model2.maxNumNeuronsPerGroup).toBe(0);
});