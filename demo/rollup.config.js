import fs from "fs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

let mainHash = null;

function buildMain() {
  return {
    generateBundle(outputOptions, bundle, isWrite) {
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
      fs.writeFileSync("js.build.out/main.js", content);
    }
  }
}

export default {
  input: ["js/main.js"],
  output: {
    dir: "./build.out/",
    format: "esm",
    sourcemap: false,
    entryFileNames: "[name].[hash].js",
  },
  plugins: [
    resolve(),
    buildMain(),
    terser()
  ],
};
