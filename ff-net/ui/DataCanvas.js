const Color = require("../common/Color");
const DataPoint = require("./DataPoint");
const DragBehavior = require("./DragBehavior");

class DataCanvas {
  constructor(args = {}) {
    const headless = this.headless = args.headless ?? false;

    if (!headless) {
      const canvas = this.domElement = document.createElement("canvas");
      canvas.width = args.domWidth ?? 250;
      canvas.height = args.domHeight ?? 250;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      this.ctx = ctx;

      this.dragBehavior = new DragBehavior(canvas);
      this.dragBehavior.processDragBegin = this.processDragBegin.bind(this);
      this.dragBehavior.processDragProgress = this.processDragProgress.bind(this);
    }

    this.dataWidth = args.dataWidth ?? 50;
    this.dataHeight = args.dataHeight ?? 50;
    
    this.dataPoints = [];
    this.clearPixels();

    this.xyToPixel = (x, y) => {
      return 0.5;
    }
  }

  clearPixels() {
    this.pixels = [];
    for (let i = 0; i < this.dataWidth; i++) {
      this.pixels.push([]);
      for (let j = 0; j < this.dataHeight; j++) {
        this.pixels[i].push(0);
      }
    }
  }

  updatePixels() {
    const width = this.dataWidth;
    const height = this.dataHeight;
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        const p = this.xyToPixel(i / (width - 1), j / (height - 1));
        if (p < 0 || p > 1) {
          throw new Error(`pixel value must be between 0 and 1, found ${p}`);
        }
        this.pixels[i][j] = p;
      }
    }
  }

  flushPixels() {
    const canvas = this.domElement;
    const ctx = this.ctx;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const width = this.dataWidth;
    const height = this.dataHeight;

    const fWidth = canvasWidth / width;
    const fHeight = canvasHeight / height;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const canvasImageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const numPixels = canvasImageData.data.length / 4;

    for (let i = 0; i < numPixels; i++) {
      const y = Math.floor(i / canvasWidth);
      const x = i % canvasWidth;
      const ii = Math.floor(x / fWidth);
      const jj = Math.floor(y / fHeight);
      const p = this.pixels[ii][jj];
      const color = Color.lightRed.blend(Color.lightBlue, p);
      const offset = 4 * i
      canvasImageData.data[offset    ] = Math.round(color.r * 255);
      canvasImageData.data[offset + 1] = Math.round(color.g * 255);
      canvasImageData.data[offset + 2] = Math.round(color.b * 255);
      canvasImageData.data[offset + 3] = 255;
    }
    ctx.putImageData(canvasImageData, 0, 0);
  }

  addDataPoint(x, y, label) {
    const dataPoint = new DataPoint(this, x, y, label);
    this.dataPoints.push(dataPoint);
    return dataPoint;
  }

  clear() {
    this.dataPoints = [];
  }

  render() {
    this.updatePixels();
    if (!this.headless) {
      this.flushPixels(); 
    }
    this.dataPoints.forEach((dataPoint) => dataPoint.render());
  }

  processDragBegin(event) {
    for (let i = 0; i < this.dataPoints.length; i++) {
      const dataPoint = this.dataPoints[i];

      const dx = event.cursor.x - dataPoint.x * this.domElement.width;
      const dy = event.cursor.y - dataPoint.y * this.domElement.height;

      const radius = dataPoint.radius;
      const selectionRadius = radius * 3;

      if (dx * dx + dy * dy <= selectionRadius * selectionRadius) {
        const dragState = this.dragBehavior.dragState = {};
        dragState.dataPoint = dataPoint;
        dragState.offset = { x: dx, y: dy };
        break;
      }
    };
  }

  processDragProgress(event) {
    const dataPoint = this.dragBehavior.dragState.dataPoint;
    const offset = this.dragBehavior.dragState.offset;

    dataPoint.x = (event.cursor.x - offset.x) / this.domElement.width;
    dataPoint.y = (event.cursor.y - offset.y) / this.domElement.height;

    if (dataPoint.x < 0) dataPoint.x = 0;
    else if (dataPoint.x > 1) dataPoint.x = 1;
    if (dataPoint.y < 0) dataPoint.y = 0;
    else if (dataPoint.y > 1) dataPoint.y = 1;
  }

  toData() {
    const data = this.dataPoints.map((dataPoint) => dataPoint.toData());
    return data;
  }

  loadFromData(data) {
    this.dataPoints = [];
    data.forEach((item) => {
      this.addDataPoint(item.x, item.y, item.label);
    });
  }

  static fromData(data) {
    const dataCanvas = new DataCanvas();
    dataCanvas.loadFromData(data);
    return dataCanvas;
  }
}

module.exports = DataCanvas;
