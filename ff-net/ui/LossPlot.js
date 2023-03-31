class LossPlot {
  constructor(args = {}) {
    const width = args.width ?? 500;
    const height = args.height ?? 100;
    const canvas = this.domElement = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    this.ctx = canvas.getContext("2d");	
    this.maxDataLength = width;
    this.data = [];
    this.minTopLoss = args.minTopLoss ?? 4;
    this.topLoss = this.minTopLoss;
  }

  update(totalLoss) {
    if (this.data.length == this.maxDataLength) this.data.shift();
    
    this.data.push({
      totalLoss: totalLoss
    });

    const totalLosses = this.data.map((item) => item.totalLoss)
    const maxTotalLoss = Math.max.apply(null, totalLosses);
    if (maxTotalLoss > this.minTopLoss) this.topLoss = maxTotalLoss;
    else this.topLoss = this.minTopLoss;

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

  clear() {
    this.data = [];
  }
}

module.exports = LossPlot;