import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "rollup-plugin-babel";

export default {
  input: ["js/main.js"],
  output: {
    file: "js.build.out/main.js",
    // format: "es"
    format: "iife",
    // globals: {
    //   "ff-net": "ffnet"
    // }
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              node: "current",
            },
          },
        ],
      ],
    }),
  ],
};
