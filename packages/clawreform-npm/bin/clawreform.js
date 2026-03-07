#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const { ensureBinaryInstalled } = require("../lib/install");

async function main() {
  let binaryPath;
  try {
    binaryPath = await ensureBinaryInstalled();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`clawreform npm launcher failed to install runtime binary: ${message}`);
    process.exit(1);
  }

  const result = spawnSync(binaryPath, process.argv.slice(2), {
    stdio: "inherit",
    env: process.env
  });

  if (result.error) {
    console.error(`Failed to run clawreform binary: ${result.error.message}`);
    process.exit(1);
  }

  process.exit(result.status ?? 1);
}

main();
