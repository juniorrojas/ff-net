const puppeteer = require("puppeteer");

class Window {
  constructor(args) {
    if (args == null) args = {};
    this.width = args.width ?? 400;
    this.height = args.height ?? 400;
    this.headless = args.headless ?? false;
    if (args.indexFilename == null) {
      throw new Error("indexFilename required");
    }
    this.indexFilename = args.indexFilename;
  }

  async launch() {
    let width = this.width;
    let height = this.height;
    let browser = this.browser = await puppeteer.launch({
      headless: this.headless,
      args: [
        `--window-size=${this.width},${this.height}`
      ]
    });
    let page = await browser.newPage();
    await page.setViewport({ width: width, height: height, deviceScaleFactor: 1 });
    await page.goto(`file://${this.indexFilename}`);
    this.page = page;
  }

  async evaluate() {
    return await this.page.evaluate.apply(this.page, arguments);
  }

  async screenshot() {
    return await this.page.screenshot.apply(this.page, arguments);
  }
  
  async close() {
    await this.browser.close();
  }
}

module.exports = Window;