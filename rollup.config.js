import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

function header() {
  return {
    renderChunk(code) {
      return `/**
 * ff-net
 * (c) 2023 Junior Rojas
 * License: MIT
 */
${code}`;
    }
  };
}

const configs = [];

for (let minified of [true, false]) {
  configs.push({
    input: "ff-net/index.js",
    output: {
      file: `build/ff-net${minified ? ".min": ""}.mjs`,
      format: "esm",
      sourcemap: false
    },
    plugins: [
      resolve(),
      commonjs(),
      ...(minified ? [terser()] : []),
      header(),
    ],
  });
}

for (let minified of [true, false]) {
  configs.push({
    input: "ff-net/index.js",
    output: {
      file: `build/ff-net${minified ? ".min": ""}.js`,
      format: "umd",
      name: "ffnet",
      sourcemap: false
    },
    plugins: [
      resolve(),
      commonjs(),
      ...(minified ? [terser()] : []),
      header(),
    ],
  });
}

export default configs;