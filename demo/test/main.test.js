const utils = require("./utils");
const { toMatchImageSnapshot } = require("jest-image-snapshot");
expect.extend({ toMatchImageSnapshot });

test("main", async () => {
  const window = new utils.Window({
    headless: true,
    width: 800,
    height: 700,
    indexFilename: `${__dirname}/../index.html`
  });
  try {
    await window.launch();
    await window.evaluate(async () => {
      function waitInit() {
        return new Promise((resolve, reject) => {
          const interval = setInterval(() => {
            if (window.app != null) {
              clearInterval(interval);
              resolve();
            }
          }, 1);
        });
      }
      await waitInit();

      const app = window.app;
      app.pause();
      
      const model = app.model;
      model.loadData(window.initData.model);
      model.render();

      const dataCanvas = app.dataCanvas;
      dataCanvas.loadFromData(window.initData.dataPoints)
      dataCanvas.render(app.classify);

      const lossPlot = app.controlPanel.lossPlot;
      lossPlot.clear();
      lossPlot.render();

      app.controlPanel.update({
        dataLoss: 0,
        regularizationLoss: 0,
        totalLoss: 0
      })
    });

    const { numDataPoints, numNeurons, numLinks } = await window.evaluate(() => {
      return {
        numDataPoints: app.dataCanvas.dataPoints.length,
        numNeurons: app.model.numNeurons(),
        numLinks: app.model.numLinks()
      }
    });
    expect(numNeurons).toBe(15);
    expect(numLinks).toBe(47);
    expect(numDataPoints).toBe(51);

    // const screenshot = await window.screenshot();
    // expect(screenshot).toMatchImageSnapshot();
  } finally {
    await window.close();
  }
}, 10000);