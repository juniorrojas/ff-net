import ffnet from "https://raw.githubusercontent.com/juniorrojas/ff-net/master/build/ff-net.mjs";

const model = new ffnet.Sequential();
model.addNeuronGroup(3);
model.addFullyConnectedLayer(4);
model.addFullyConnectedLayer(1);
console.log(model.numNeurons());
