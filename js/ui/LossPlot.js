const minTopError = 4;

class LossPlot {
  constructor() {
    const canvas = this.domElement = document.createElement("canvas");
    canvas.id = "error-canvas";
    this.ctx = canvas.getContext("2d");	
    this.maxDataLength = canvas.width;
    this.data = [];
    this.topError = minTopError;
  }

  getMaxTotalError() {
    let max = 0;
    this.data.forEach((item) => {
      const totalError = item.totalError;
      if (totalError > max) max = totalError;
    });
    return max;
  }

  update(dataError, regularizationError) {
    if (this.data.length == this.maxDataLength) {
      this.data.shift();
    }
    const totalError = dataError + regularizationError;
    this.data.push({
      dataError: dataError,
      regularizationError: regularizationError,
      totalError: totalError
    });
    const maxTotalError = this.getMaxTotalError();
    if (maxTotalError > minTopError) this.topError = maxTotalError;
    else this.topError = minTopError;
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const width = this.domElement.width;
    const height = this.domElement.height;
    ctx.clearRect(0, 0, width, height);
    
    this.data.forEach((item, i) => {
      const totalError = item.totalError;
      const x = i / (this.maxDataLength - 1) * width;
      const y = height * (1 - totalError / this.topError);
      ctx.beginPath();
      ctx.strokeStyle = "rgb(255, 221, 78)";
      ctx.moveTo(x, height);
      ctx.lineTo(x, y);
      ctx.stroke();
    });
  }
}

module.exports = LossPlot;