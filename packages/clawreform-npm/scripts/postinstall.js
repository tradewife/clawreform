#!/usr/bin/env node

const path = require("node:path");
const { installBinary } = require("../lib/install");

function globalBinDir() {
  const prefix = process.env.npm_config_prefix;
  if (!prefix) {
    return null;
  }
  return process.platform === "win32" ? prefix : path.join(prefix, "bin");
}

function pathContains(targetDir) {
  if (!targetDir) {
    return false;
  }
  const pathValue = process.env.PATH || "";
  const entries = pathValue.split(path.delimiter).filter(Boolean);
  return entries.includes(targetDir);
}

async function main() {
  try {
    await installBinary();
    const binDir = globalBinDir();
    if (binDir && !pathContains(binDir)) {
      if (process.platform === "win32") {
        console.warn(`clawreform npm: global npm bin is not on PATH: ${binDir}`);
        console.warn("Open a new terminal or add it to your user PATH in System Settings.");
      } else {
        console.warn(`clawreform npm: global npm bin is not on PATH: ${binDir}`);
        console.warn(`Add it with: export PATH="${binDir}:$PATH"`);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`clawreform npm postinstall failed: ${message}`);
    process.exit(1);
  }
}

main();
