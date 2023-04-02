class Slider {
  constructor(args = {}) {
    const input = document.createElement("input");
    this.domElement = input;
    input.type = "range";
    input.min = args.min ?? 0;
    input.max = args.max ?? 100;
    input.step = args.step ?? 1;
    if (args.value != null) {
      input.value = args.value;
    }
  }
}

module.exports = Slider;