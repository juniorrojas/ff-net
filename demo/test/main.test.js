import Window from "./utils/Window.js";
import { runWebServer } from "./utils/server.js";

test("main", async () => {
  const main = async (port) => {
    const window = new Window({
      headless: true,
      width: 800,
      height: 700,
      indexUrl: `http://localhost:${port}`
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
          regularizationLoss: 0
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
    } finally {
      await window.close();
    }
  }

  await runWebServer({
    staticDirname: `${__dirname}/../build.out/`,
    onReady: main
  });
}, 10000);