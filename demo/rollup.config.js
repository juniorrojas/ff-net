import fs from "fs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

function buildMain() {
  return {
    generateBundle(outputOptions, bundle, isWrite) {
      if (isWrite) {
        for (let k in bundle) {
          const filename = bundle[k].fileName;
          const i = filename.indexOf(".");
          if (filename.substr(0, i) == "main") {
            mainHash = filename.substring(i + 1, filename.lastIndexOf("."));
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

let mainHash = null;

export default {
  input: ["js/main.js"],
  output: {
    dir: "./js.build.out/",
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
