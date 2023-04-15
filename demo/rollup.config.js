import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";

export default {
  input: ["js/main.js"],
  output: {
    file: "js.build.out/main.js",
    format: "iife",
  },
  plugins: [
    resolve(),
    commonjs()
  ],
};
