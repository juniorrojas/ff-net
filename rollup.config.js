import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "rollup-plugin-babel";

export default {
  input: "ff-net/index.js",
  output: {
    file: "build/ff-net.js",
    format: "esm",
    sourcemap: false,
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
