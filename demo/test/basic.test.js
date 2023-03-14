const utils = require("./utils");

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
    });
  } finally {
    await window.close();
  }
});