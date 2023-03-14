const ffnet = require("ff-net");
const Color = ffnet.common.Color;

class DataPoint {
  constructor(canvas, x, y, label) {
    this.canvas = canvas;
    this.x = x;
    this.y = y;
    this.label = label;
    this.radius = 5;
  }

  render() {
    const ctx = this.canvas.ctx;
    const width = this.canvas.domElement.width;
    const height = this.canvas.domElement.height;
    
    let fillColor;
    if (this.label == 0) fillColor = Color.red;
    else fillColor = Color.blue;
    const strokeColor = fillColor.blend(Color.black, 0.6);
    
    ctx.beginPath();
    ctx.fillStyle = fillColor.toString();
    ctx.strokeStyle = strokeColor.toString();
    ctx.arc(
      this.x * width, this.y * height,
      this.radius,
      0, 2 * Math.PI
    );
    ctx.fill();
    ctx.stroke();
  }

  toData() {
    return {
      x: this.x,
      y: this.y,
      label: this.label
    }
  }
}

module.exports = DataPoint;