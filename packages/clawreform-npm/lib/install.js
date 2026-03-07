const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const REPO = process.env.CLAWREFORM_NPM_REPO || "aegntic/clawreform";

function normalizeVersion(version) {
  if (!version) {
    throw new Error("Missing package version.");
  }
  return version.startsWith("v") ? version : `v${version}`;
}

function resolveTargetFor(platform, arch) {
  if (platform === "linux" && arch === "x64") {
    return { target: "x86_64-unknown-linux-gnu", ext: "tar.gz", binName: "clawreform" };
  }
  if (platform === "linux" && arch === "arm64") {
    return { target: "aarch64-unknown-linux-gnu", ext: "tar.gz", binName: "clawreform" };
  }
  if (platform === "darwin" && arch === "x64") {
    return { target: "x86_64-apple-darwin", ext: "tar.gz", binName: "clawreform" };
  }
  if (platform === "darwin" && arch === "arm64") {
    return { target: "aarch64-apple-darwin", ext: "tar.gz", binName: "clawreform" };
  }
  if (platform === "win32" && arch === "x64") {
    return { target: "x86_64-pc-windows-msvc", ext: "zip", binName: "clawreform.exe" };
  }
  if (platform === "win32" && arch === "arm64") {
    return { target: "aarch64-pc-windows-msvc", ext: "zip", binName: "clawreform.exe" };
  }

  throw new Error(`Unsupported platform/arch: ${platform}/${arch}`);
}

function resolveTarget() {
  return resolveTargetFor(process.platform, process.arch);
}

function assetUrl(version, target, ext) {
  const file = `clawreform-${target}.${ext}`;
  return `https://github.com/${REPO}/releases/download/${version}/${file}`;
}

async function downloadToFile(url, destination) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "clawreform-npm-installer"
    }
  });

  if (!response.ok) {
    throw new Error(`Download failed (${response.status}): ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(destination, Buffer.from(arrayBuffer));
}

function extractArchive(archivePath, destinationPath, ext) {
  if (ext === "tar.gz") {
    const result = spawnSync("tar", ["-xzf", archivePath, "-C", destinationPath], {
      stdio: "pipe"
    });
    if (result.status !== 0) {
      throw new Error(`tar extraction failed: ${result.stderr?.toString() || "unknown error"}`);
    }
    return;
  }

  if (ext === "zip") {
    const psArchive = archivePath.replace(/'/g, "''");
    const psDest = destinationPath.replace(/'/g, "''");
    const psScript = `$ErrorActionPreference='Stop'; Expand-Archive -Path '${psArchive}' -DestinationPath '${psDest}' -Force`;
    const result = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", psScript], {
      stdio: "pipe"
    });

    if (result.status === 0) {
      return;
    }

    const tarResult = spawnSync("tar", ["-xf", archivePath, "-C", destinationPath], {
      stdio: "pipe"
    });
    if (tarResult.status !== 0) {
      const powerShellError = result.stderr?.toString() || "unknown powershell error";
      const tarError = tarResult.stderr?.toString() || "unknown tar error";
      throw new Error(`zip extraction failed. powershell: ${powerShellError}; tar: ${tarError}`);
    }
    return;
  }

  throw new Error(`Unsupported archive extension: ${ext}`);
}

function findFileRecursively(rootDir, fileName) {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isFile() && entry.name === fileName) {
      return fullPath;
    }
    if (entry.isDirectory()) {
      const nested = findFileRecursively(fullPath, fileName);
      if (nested) {
        return nested;
      }
    }
  }
  return null;
}

function installedBinaryPath() {
  const binName = process.platform === "win32" ? "clawreform.exe" : "clawreform";
  return path.join(__dirname, "bin", binName);
}

async function installBinary(options = {}) {
  const log = typeof options.log === "function" ? options.log : console.log;
  const version = normalizeVersion(options.version || process.env.CLAWREFORM_VERSION || require("../package.json").version);
  const { target, ext, binName } = resolveTarget();
  const downloadUrl = assetUrl(version, target, ext);

  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "clawreform-npm-"));
  const archivePath = path.join(tmpRoot, `clawreform.${ext}`);
  const extractPath = path.join(tmpRoot, "extract");
  fs.mkdirSync(extractPath, { recursive: true });

  try {
    log(`clawreform npm: downloading ${version} (${target})`);
    await downloadToFile(downloadUrl, archivePath);
    extractArchive(archivePath, extractPath, ext);

    const sourceBinary = findFileRecursively(extractPath, binName);
    if (!sourceBinary) {
      throw new Error(`Could not find ${binName} in downloaded archive.`);
    }

    const destination = installedBinaryPath();
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(sourceBinary, destination);
    if (process.platform !== "win32") {
      fs.chmodSync(destination, 0o755);
    }

    return destination;
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
}

async function ensureBinaryInstalled() {
  const destination = installedBinaryPath();
  if (fs.existsSync(destination)) {
    return destination;
  }
  return installBinary();
}

module.exports = {
  ensureBinaryInstalled,
  installBinary,
  installedBinaryPath,
  resolveTargetFor,
  resolveTarget
};
