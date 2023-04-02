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
  dataCanvas.xyToPixel = (x, y) => {
    return x;
  };
  dataCanvas.updatePixels();
  expect(dataCanvas.pixels).toEqual([
    [0, 0, 0],
    [0.5, 0.5, 0.5],
    [1, 1, 1]
  ]);
});