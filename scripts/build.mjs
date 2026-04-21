import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

import * as esbuild from "esbuild";

const rootDir = path.resolve(import.meta.dirname, "..");
const distDir = path.join(rootDir, "dist");
const staticDir = path.join(rootDir, "static");

const isWatchMode = process.argv.includes("--watch");

async function copyStaticFiles() {
  await cp(staticDir, distDir, { recursive: true });
}

async function prepareDistDirectory() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
}

const buildOptions = {
  absWorkingDir: rootDir,
  bundle: true,
  entryPoints: {
    content: "src/content/index.ts",
    options: "src/options/index.ts",
    popup: "src/popup/index.ts"
  },
  format: "iife",
  logLevel: "info",
  minify: false,
  outdir: "dist",
  platform: "browser",
  sourcemap: false,
  target: ["chrome120"]
};

await prepareDistDirectory();

if (isWatchMode) {
  const context = await esbuild.context(buildOptions);

  await context.watch();
  await context.rebuild();
  await copyStaticFiles();

  console.log("Watching extension sources...");
} else {
  await esbuild.build(buildOptions);
  await copyStaticFiles();
}

