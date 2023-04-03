const ffnet = require("ff-net");
const { closeArraysCheck } = require("./utils");

expect.extend({
  toBeCloseToArray: closeArraysCheck
})

test("data loss", () => {
  const model = new ffnet.Sequential({
    headless: true
  });
  model.addNeuronGroup(2);
  const l1 = model.addFullyConnectedLayer(3);
  const l2 = model.addFullyConnectedLayer(1);

  const l1w = [
    [-0.0053,  0.3793],
    [-0.5820, -0.5204],
    [-0.2723,  0.1896]
  ];
  const l1b = [-0.0140,  0.5607, -0.0628];
  const l2w = [
    [ 0.1528, -0.1745, -0.1135]
  ];
  const l2b = [-0.5516];

  l1.setWeightFromArray(l1w);
  expect(l1.getWeightArray()).toEqual(l1w);
  l1.setBiasFromArray(l1b);
  expect(l1.getBiasArray()).toEqual(l1b);

  l2.setWeightFromArray(l2w);
  expect(l2.getWeightArray()).toEqual(l2w);
  l2.setBiasFromArray(l2b);
  expect(l2.getBiasArray()).toEqual(l2b);

  const reg = 0.0;
  const inputNeuronGroup = model.getInputNeuronGroup();
  inputNeuronGroup.neurons[0].activation = 0.2;
  inputNeuronGroup.neurons[1].activation = 0.3;
  model.forward({ regularization: reg });
  const outputNeuron =  model.getOutputNeuronGroup().neurons[0];
  const output = outputNeuron.activation;
  expect(output).toBeCloseTo(0.3484);

  const l1wGrad = [
    [ 0.0017,  0.0026],
    [-0.0019, -0.0029],
    [-0.0013, -0.0019]
  ];
  const l1bGrad = [0.0086, -0.0097, -0.0064];
  const l2wGrad = [
    [0.1191, 0.1297, 0.1101]
  ];
  const l2bGrad = [0.2270];

  model.zeroGrad();
  outputNeuron.activationGrad = 1.0;
  model.backward();
  expect(l1.getWeightGradArray()).toBeCloseToArray(l1wGrad);
  expect(l1.getBiasGradArray()).toBeCloseToArray(l1bGrad);
  expect(l2.getWeightGradArray()).toBeCloseToArray(l2wGrad);
  expect(l2.getBiasGradArray()).toBeCloseToArray(l2bGrad);
});

test("regularization loss", () => {
  const model = new ffnet.Sequential({
    headless: true
  });
  model.addNeuronGroup(2);
  const l1 = model.addFullyConnectedLayer(3);
  const l2 = model.addFullyConnectedLayer(1);

  const l1w = [
    [-0.0053,  0.3793],
    [-0.5820, -0.5204],
    [-0.2723,  0.1896]
  ];
  const l1b = [-0.0140,  0.5607, -0.0628];
  const l2w = [
    [ 0.1528, -0.1745, -0.1135]
  ];
  const l2b = [-0.5516];

  l1.setWeightFromArray(l1w);
  expect(l1.getWeightArray()).toEqual(l1w);
  l1.setBiasFromArray(l1b);
  expect(l1.getBiasArray()).toEqual(l1b);

  l2.setWeightFromArray(l2w);
  expect(l2.getWeightArray()).toEqual(l2w);
  l2.setBiasFromArray(l2b);
  expect(l2.getBiasArray()).toEqual(l2b);

  const reg = 2.0;
  const inputNeuronGroup = model.getInputNeuronGroup();
  inputNeuronGroup.neurons[0].activation = 0.2;
  inputNeuronGroup.neurons[1].activation = 0.3;
  model.forward();
  const regularizationLoss = model.forwardRegularization({ regularization: reg });
  expect(regularizationLoss).toBeCloseTo(0.9302);
  const outputNeuron =  model.getOutputNeuronGroup().neurons[0];
  const output = outputNeuron.activation;
  expect(output).toBeCloseTo(0.3484);

  const l1wGrad = [
    [-0.0089,  0.7612],
    [-1.1659, -1.0437],
    [-0.5460,  0.3773]
  ];
  const l1bGrad = [0.0086, -0.0097, -0.0064];
  const l2wGrad = [
    [0.4247, -0.2192, -0.1169]
  ];
  const l2bGrad = [0.2270];

  model.zeroGrad();
  outputNeuron.activationGrad = 1.0;
  model.backward();
  model.backwardRegularization({ regularization: reg });
  expect(l1.getWeightGradArray()).toBeCloseToArray(l1wGrad);
  expect(l1.getBiasGradArray()).toBeCloseToArray(l1bGrad);
  expect(l2.getWeightGradArray()).toBeCloseToArray(l2wGrad);
  expect(l2.getBiasGradArray()).toBeCloseToArray(l2bGrad);
});