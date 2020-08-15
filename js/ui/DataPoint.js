const Color = require("../common/Color");

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
    if (this.label == 0) fillColor = Color.RED;
    else fillColor = Color.BLUE;
    const strokeColor = fillColor.blend(Color.BLACK, 0.6);
    
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
}

module.exports = DataPoint;