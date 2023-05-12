# demo

Install dependencies and watch source for development.

```
npm ci
npm run watch
```

Run an HTTP server serving files from `build.out` to preview the build.

Build and publish to `gh-pages`.

```
npm run build
./scripts/deploy --push
```