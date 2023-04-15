import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

export default [
  {
    input: "ff-net/index.js",
    output: {
      file: "build/ff-net.module.js",
      format: "esm",
      sourcemap: false,
    },
    plugins: [
      resolve(),
      commonjs()
    ],
  },
  {
    input: "ff-net/index.js",
    output: {
      file: "build/ff-net.umd.js",
      format: "umd",
      name: "ffnet"
    },
    plugins: [
      resolve(),
      commonjs()
    ],
  },
  {
    input: "ff-net/index.js",
    output: {
      file: "build/ff-net.umd.min.js",
      format: "umd",
      name: "ffnet"
    },
    plugins: [
      resolve(),
      commonjs(),
      terser()
    ],
  }
];
