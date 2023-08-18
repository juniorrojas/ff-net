const ffnet = require("ff-net");
const { toBeCloseToArray } = require("./utils");
expect.extend({ toBeCloseToArray });

test("single neuron position", () => {
  const sequential = new ffnet.Sequential({
    headless: true,
    width: 200,
    height: 100
  });
  const g = sequential.addNeuronGroup(1);
  expect(sequential.numNeurons()).toBe(1);
  const neuron = g.neurons[0];
  const pos = neuron.getPosition();
  expect(pos).toBeCloseToArray([100, 50]);
});