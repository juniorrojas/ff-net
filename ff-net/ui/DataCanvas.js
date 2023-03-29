const Color = require("../common/Color");
const DataPoint = require("./DataPoint");
const DragBehavior = require("./DragBehavior");

class DataCanvas {
  constructor() {
    this.dataPoints = [];
    const canvas = this.domElement = document.createElement("canvas");
    canvas.width = 250;
    canvas.height = 250;
    this.ctx = canvas.getContext("2d");

    this.width = 50;
    this.height = 50;
    this.pixelColors = [];
    for (let i = 0; i < this.width; i++) {
      this.pixelColors.push([]);
      for (let j = 0; j < this.height; j++) {
        this.pixelColors[i].push(0);
      }
    }

    this.dragBehavior = new DragBehavior(canvas);
    this.dragBehavior.processDragBegin = this.processDragBegin.bind(this);
    this.dragBehavior.processDragProgress = this.processDragProgress.bind(this);
  }

  addDataPoint(x, y, label) {
    const dataPoint = new DataPoint(this, x, y, label);
    this.dataPoints.push(dataPoint);
    return dataPoint;
  }

  render(classify) {
    const ctx = this.ctx;
    const canvas = this.domElement;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const width = this.width;
    const height = this.height;

    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        const label = classify(i / width, j / height);
        const color = Color.lightRed.blend(Color.lightBlue, label);
        this.pixelColors[i][j] = color;
      }
    }

    const fWidth = canvasWidth / width;
    const fHeight = canvasHeight / height;
    const canvasImageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    for (let i = 0; i < canvasImageData.data.length / 4; i++) {
      const y = Math.floor(i / canvasWidth);
      const x = i % canvasWidth;
      const ii = Math.floor(x / fWidth);
      const jj = Math.floor(y / fHeight);
      const color = this.pixelColors[ii][jj];
      canvasImageData.data[4 * i] = Math.round(color.r * 255);
      canvasImageData.data[4 * i + 1] = Math.round(color.g * 255);
      canvasImageData.data[4 * i + 2] = Math.round(color.b * 255);
      canvasImageData.data[4 * i + 3] = 255;
    }
    ctx.putImageData(canvasImageData, 0, 0);

    this.dataPoints.forEach((dataPoint) => dataPoint.render());
  }

  computeCursor(event) {
    const rect = this.domElement.getBoundingClientRect();
    let clientX, clientY;
    if (event.touches == null) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }
    const left = clientX - rect.left;
    const top = clientY - rect.top;
    const cursor = {x: left, y: top};
    event.cursor = cursor;
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
        dragState.offset = {x: dx, y: dy};
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
