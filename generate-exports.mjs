
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("src/icons");
const OUTPUT = path.resolve("src/index.ts");

function collectFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true })
    .flatMap(entry => {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectFiles(fullPath);
      }

      return entry.isFile() && /\.tsx?$/.test(entry.name)
        ? [fullPath]
        : [];
    });
}

if (!fs.existsSync(ROOT)) {
  throw new Error(`Icon directory not found: ${ROOT}`);
}

const files = collectFiles(ROOT).sort();
const usedNames = new Set();
const exports = [];

for (const file of files) {
  const relative = path.relative(ROOT, file)
    .replace(/\\/g, "/")
    .replace(/\.tsx?$/, "");

  const name = path.posix.basename(relative);

  if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
    throw new Error(`Invalid component name "${name}" in ${file}`);
  }

  if (usedNames.has(name)) {
    throw new Error(`Duplicate component name: ${name}`);
  }

  usedNames.add(name);

  exports.push(
    `export { default as ${name} } from ${JSON.stringify("./icons/" + relative)};`
  );
}

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

fs.writeFileSync(
  OUTPUT,
  exports.join("\n") + "\n",
  "utf8"
);

console.log(`Generated ${exports.length} icon exports.`);
console.log(`Output: ${OUTPUT}`);
