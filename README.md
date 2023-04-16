<div align="center">
  <img src="media/logo.png" width="300px">
</div>

---

[![test](https://github.com/juniorrojas/ff-net/actions/workflows/test.yml/badge.svg)](https://github.com/juniorrojas/ff-net/actions/workflows/test.yml)

Feedforward neural network learning in real time.

[live demo](http://juniorrojas.github.io/ff-net)

![screenshot](media/screenshot.png)

## build demo

```
cd demo
```

Install dependencies

```
npm ci
```

Watch source for development

```
npm run watch
```

Open `index.html`

Build and publish to `gh-pages`

```
npm run build
./scripts/deploy --push
```

## Install

Install with npm 

```
npm install juniorrojas/ff-net
```

Then import using commonjs

```js
const ffnet = require("ff-net");
```

or ES6

```js
import ffnet from "ff-net";
```

To use in the browser, use the UMD build that exposes `ffnet` as a global variable.

```html
<script src="https://cdn.rawgit.com/juniorrojas/ff-net/master/build/ff-net.js"></script>
```


## API reference

### sequential

```js
const model = new ffnet.Sequential({
  createDomElement: true,
  width: 200,
  height: 200
});
model.addNeuronGroup(2);
model.addFullyConnectedLayer(4);
model.addFullyConnectedLayer(4);
model.addFullyConnectedLayer(1);
model.randomizeParameters();
document.body.appendChild(model.domElement);
model.render();
```

<div align="center">
  <img src="media/sequential.png" width="200px"></img>
</div>

### data canvas

```js
const dataCanvas = new ffnet.ui.DataCanvas();
dataCanvas.addDataPoint(0.5, 0.5, 1);
dataCanvas.addDataPoint(0.4, 0.1, 0);
dataCanvas.xyToPixel = (x, y) => {
  return model.forward([x, y])[0];
}
document.body.appendChild(dataCanvas.domElement);
dataCanvas.render();
```

<div align="center">
  <img src="media/datacanvas.png" width="200px"></img>
</div>


### training

```js
setInterval(() => {
  model.train({
    dataPoints: dataCanvas.dataPoints,
    lr: 1e-1,
    iters: 10
  });
  dataCanvas.render();
}, 1000 / 60);
```

<div align="center">
  <img src="media/training.png" width="200px"></img>
</div>
