const ffnet = require("ff-net");

test("pixels", () => {
  const dataCanvas = new ffnet.ui.DataCanvas({
    headless: true,
    dataWidth: 3,
    dataHeight: 3
  });
  expect(dataCanvas.pixels).toEqual([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ]);
});