import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "ff-net/index.js",
  output: {
    file: "build/ff-net.js",
    format: "esm",
    sourcemap: false,
  },
  plugins: [
    resolve(),
    commonjs()
  ],
};
