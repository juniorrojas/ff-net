const Color = require("../common/Color");
const DataPoint = require("./DataPoint");

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

    this.setUpDragBehavior();
  }

  addDataPoint(x, y, label) {
    this.dataPoints.push(new DataPoint(this, x, y, label));
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
        var label = classify(i / width, j / height);
        var color = Color.LIGHT_RED.blend(Color.LIGHT_BLUE, label);
        this.pixelColors[i][j] = color;
      }
    }

    var fWidth = canvasWidth / width;
    var fHeight = canvasHeight / height;
    var canvasImageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    for (var i = 0; i < canvasImageData.data.length / 4; i++) {
      var y = Math.floor(i / canvasWidth);
      var x = i % canvasWidth;
      var ii = Math.floor(x / fWidth);
      var jj = Math.floor(y / fHeight);
      var color = this.pixelColors[ii][jj];
      canvasImageData.data[4 * i] = Math.round(color.r * 255);
      canvasImageData.data[4 * i + 1] = Math.round(color.g * 255);
      canvasImageData.data[4 * i + 2] = Math.round(color.b * 255);
      canvasImageData.data[4 * i + 3] = 255;
    }
    ctx.putImageData(canvasImageData, 0, 0);

    for (var i = 0; i < this.dataPoints.length; i++) {
      var dataPoint = this.dataPoints[i];
      dataPoint.render();
    }
  }

  computeCursor(event) {
    var rect = this.domElement.getBoundingClientRect();
    var clientX, clientY;
    if (event.touches == null) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }
    var left = clientX - rect.left;
    var top = clientY - rect.top;
    var cursor = {x: left, y: top};
    event.cursor = cursor;
  }

  setUpDragBehavior() {
    var canvas = this.domElement;

    this.dragState = null;

    this.handleDragBegin = this.handleDragBegin.bind(this);
    canvas.addEventListener("touchstart", this.handleDragBegin);
    canvas.addEventListener("mousedown", this.handleDragBegin);

    this.handleDragProgress = this.handleDragProgress.bind(this);
    window.addEventListener("mousemove", this.handleDragProgress);
    window.addEventListener("touchmove", this.handleDragProgress);

    this.handleDragEnd = this.handleDragEnd.bind(this);
    window.addEventListener("mouseup", this.handleDragEnd);
    window.addEventListener("touchend", this.handleDragEnd);
    window.addEventListener("touchcancel", this.handleDragEnd);
  }

  handleDragBegin(event) {
    event.preventDefault();
    this.computeCursor(event);

    for (var i = 0; i < this.dataPoints.length; i++) {
      var dataPoint = this.dataPoints[i];

      var dx = event.cursor.x - dataPoint.x * this.domElement.width;
      var dy = event.cursor.y - dataPoint.y * this.domElement.height;

      var r = dataPoint.radius;

      if (dx * dx + dy * dy <= r * r) {
        this.dragState = {
          dataPoint: dataPoint,
          offset: {x: dx, y: dy}
        };
        break;
      }
    }
  }

  handleDragProgress(event) {
    if (this.dragState == null) return;
    this.computeCursor(event);
    event.preventDefault();

    var dataPoint = this.dragState.dataPoint;
    var offset = this.dragState.offset;

    dataPoint.x = (event.cursor.x - offset.x) / this.domElement.width;
    dataPoint.y = (event.cursor.y - offset.y) / this.domElement.height;

    if (dataPoint.x < 0) dataPoint.x = 0;
    else if (dataPoint.x > 1) dataPoint.x = 1;
    if (dataPoint.y < 0) dataPoint.y = 0;
    else if (dataPoint.y > 1) dataPoint.y = 1;
  }

  handleDragEnd(event) {
    if (this.dragState == null) return;
    var dataPoint = this.dragState.dataPoint;
    this.dragState = null;
  }

  toData() {
    const data = [];
    for (var i = 0; i < this.dataPoints.length; i++) {
      const dataPoint = this.dataPoints[i];
      data.push({
        x: dataPoint.x,
        y: dataPoint.y,
        label: dataPoint.label
      });
    }
    return data;
  }
}

DataCanvas.fromData = function(data) {
  const dataCanvas = new DataCanvas();
  data.forEach((item) => {
    dataCanvas.addDataPoint(item.x, item.y, item.label);
  });
  return dataCanvas;
}

module.exports = DataCanvas;
