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
  } finally {
    await window.close();
  }
});