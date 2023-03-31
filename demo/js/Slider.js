class Slider {
  constructor(args = {}) {
    const input = document.createElement("input");
    input.min = args.min ?? 0;
    input.max = args.max ?? 100;
    input.step = args.step ?? 1;
    this.domElement = input;
    input.type = "range";
  }
}

module.exports = Slider;