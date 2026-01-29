const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function readJson(fileName, fallback) {
  const filePath = path.join(dataDir, fileName);
  try {
    const contents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(contents);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await writeJson(fileName, fallback);
      return fallback;
    }
    throw err;
  }
}

async function writeJson(fileName, data) {
  await ensureDataDir();
  const filePath = path.join(dataDir, fileName);
  // Always include a trailing newline to avoid "no newline at end of file"
  // and to reduce diffs/format issues when users edit JSON manually.
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

module.exports = {
  dataDir,
  readJson,
  writeJson,
};
