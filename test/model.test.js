const ffnet = require("ff-net");

test("model", () => {
  const model = new ffnet.Sequential({
    headless: true
  });
  model.addNeuronGroup(2);
  const l1 = model.addFullyConnectedLayer(3);
  const l2 = model.addFullyConnectedLayer(1);

  // const l1w = [
  //   [ 0.0017,  0.0026],
  //   [-0.0019, -0.0029],
  //   [-0.0013, -0.0019]
  // ];
  // const l1b = [0.0086, -0.0097, -0.0064];
  // const l2w = [
  //   [0.1191, 0.1297, 0.1101]
  // ];
  // const l2b = [0.2270];

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
  model.reset();
  inputNeuronGroup.neurons[0].activation = 0.2;
  inputNeuronGroup.neurons[1].activation = 0.3;
  model.forward({ regularization: reg });
  // model.backward({ regularization: reg });

  const output = model.getOutputNeuronGroup().neurons[0].activation;
  // console.log(output);
  expect(output).toBeCloseTo(0.3484);
});