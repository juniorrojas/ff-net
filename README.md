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

## API reference

```html
<!DOCTYPE html>
<body>
  <script src="https://cdn.rawgit.com/juniorrojas/ff-net/master/build/ff-net.umd.js"></script>
  <script>
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
  </script>
</body>
</html>
```

<div align="center">
  <img src="media/sequential.png" width="200px"></img>
</div>