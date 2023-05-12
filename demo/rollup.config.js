import fs from "fs";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

let fileHash = null;

export default {
  input: ["js/main.js"],
  output: {
    dir: "./js.build.out/",
    // file: "js.build.out/main_.js",
    format: "esm",
    sourcemap: false,
    entryFileNames: "[name].[hash].js",
  },
  plugins: [
    resolve(),
    {
      generateBundle(outputOptions, bundle, isWrite) {
        if (isWrite) {
          for (let k in bundle) {
            const filename = bundle[k].fileName;
            const i = filename.indexOf(".");
            if (filename.substr(0, i) == "main") {
              fileHash = filename.substring(i + 1, filename.lastIndexOf("."));
              break;
            }
          }
        }
      },
      writeBundle: () => {
        const content = `import main from "./main.${fileHash}.js";\nwindow.vstr = \"${fileHash}\"\nmain();`;
        fs.writeFileSync("js.build.out/main.js", content);
      }
    },
    terser()
  ],
};
