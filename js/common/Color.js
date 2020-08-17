class Color {
  // r, g, b, a are numbers between 0 and 1
  constructor(r, g, b, a) {
    if (a == null) a = 1;
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  
  blend(c, t) {
    if (Math.abs(t) > 1) throw new Error("t must be a number between -1 and 1");
    
    let source, target;
    if (t >= 0) {
      source = this;
      target = c;
    } else {
      source = c;
      target = this;
    }
    
    return new Color(
      source.r * (1 - t) + target.r * t,
      source.g * (1 - t) + target.g * t,
      source.b * (1 - t) + target.b * t
    );
  }

  toString() {
    const r = Math.floor(255 * this.r);
    const g = Math.floor(255 * this.g);
    const b = Math.floor(255 * this.b);
    const a = this.a;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
}

Color.white = new Color(1, 1, 1);
Color.black = new Color(0, 0, 0);

Color.red = new Color(226 / 255, 86 / 255, 86 / 255);
Color.blue = new Color(135 / 255, 173 / 255, 236 / 255);

Color.lightBlue = new Color(186 / 255, 224 / 255, 251 / 255);
Color.lightRed = new Color(252 / 255, 163 / 255, 163 / 255);

module.exports = Color;