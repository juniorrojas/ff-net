import terser from "@rollup/plugin-terser";
import fs from "fs";
import fsp from "fs/promises";

const buildDirname = "build.out";
let mainHash = null;

function fileExists(filename) {
  return new Promise((resolve, reject) => {
    fs.access(filename, fs.constants.F_OK, (err) => {
      if (err) resolve(false);
      else resolve(true);
    });
  });
}

async function cleandir(dirname) {
  if (!await fileExists(dirname)) {
    await fsp.mkdir(dirname);
  } else {
    fs.rmSync(dirname, { recursive: true });
    await fsp.mkdir(dirname);
  }
}

function buildMain() {
  return {
    buildStart: async () => {
      await cleandir(buildDirname);
    },
    generateBundle: async (outputOptions, bundle, isWrite) => {
      if (isWrite) {
        for (let k in bundle) {
          const filename = bundle[k].fileName;
          const i = filename.indexOf(".");
          if (filename.substr(0, i) == "main") {
            const i2 = filename.lastIndexOf(".");
            mainHash = filename.substring(i + 1, i2);
            break;
          }
        }
      }
    },
    writeBundle() {
      const content = `import main from "./main.${mainHash}.js";\nwindow.vstr = \"${mainHash}\"\nmain();`;
      fs.writeFileSync(`${buildDirname}/main.js`, content);
      fs.copyFileSync("index.html", `${buildDirname}/index.html`);
      fs.copyFileSync("index.css", `${buildDirname}/index.css`);
    }
  }
}

export default {
  input: ["js/main.js"],
  output: {
    dir: buildDirname,
    format: "esm",
    sourcemap: false,
    entryFileNames: "[name].[hash].js",
  },
  plugins: [
    buildMain(),
    terser()
  ],
};
