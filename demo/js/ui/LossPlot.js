const minTopLoss = 4;

class LossPlot {
  constructor() {
    const canvas = this.domElement = document.createElement("canvas");
    canvas.className = "loss-plot-canvas";
    this.ctx = canvas.getContext("2d");	
    this.maxDataLength = canvas.width;
    this.data = [];
    this.topLoss = minTopLoss;
  }

  update(dataLoss, regularizationLoss) {
    if (this.data.length == this.maxDataLength) this.data.shift();

    const totalLoss = dataLoss + regularizationLoss;
    this.data.push({
      dataLoss: dataLoss,
      regularizationLoss: regularizationLoss,
      totalLoss: totalLoss
    });

    const totalLosses = this.data.map((item) => item.totalLoss)
    const maxTotalLoss = Math.max.apply(null, totalLosses);
    if (maxTotalLoss > minTopLoss) this.topLoss = maxTotalLoss;
    else this.topLoss = minTopLoss;

    this.render();
  }

  render() {
    const ctx = this.ctx;
    const width = this.domElement.width;
    const height = this.domElement.height;
    ctx.clearRect(0, 0, width, height);
    
    this.data.forEach((item, i) => {
      const totalLoss = item.totalLoss;
      const x = i / (this.maxDataLength - 1) * width;
      const y = height * (1 - totalLoss / this.topLoss);
      ctx.beginPath();
      ctx.strokeStyle = "rgb(255, 221, 78)";
      ctx.moveTo(x, height);
      ctx.lineTo(x, y);
      ctx.stroke();
    });
  }
}

module.exports = LossPlot;