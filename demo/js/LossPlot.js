const ffnet = require("../../ff-net");

class LossPlot extends ffnet.ui.LossPlot {
  constructor(args = {}) {
    super(args);
    this.domElement.className = "loss-plot";
    
    const mq = window.matchMedia("(max-width: 530px)");

    const updateMq = () => {
      if (mq.matches) {
        this.domElement.style.width = "250px";
        this.domElement.style.height = "50px";
      } else {
        this.domElement.style.width = "500px";
        this.domElement.style.height = "100px";
      }
    }

    mq.addEventListener("change", (event) => {
      updateMq();
    });

    updateMq();
  }
}

module.exports = LossPlot;