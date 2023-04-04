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