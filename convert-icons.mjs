
import fs from "node:fs";
import path from "node:path";
import { transform } from "@svgr/core";

const SOURCE_DIR = path.resolve("icon-svgs");
const OUTPUT_DIR = path.resolve("src/icons");

function collectSvgFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true })
    .flatMap(entry => {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectSvgFiles(fullPath);
      }

      return entry.isFile() && /\.svg$/i.test(entry.name)
        ? [fullPath]
        : [];
    });
}

async function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    throw new Error(`Source folder not found: ${SOURCE_DIR}`);
  }

  const files = collectSvgFiles(SOURCE_DIR);

  if (files.length === 0) {
    throw new Error(`No SVG files found in ${SOURCE_DIR}`);
  }

  // Clear previously generated components to avoid stale exports.
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let converted = 0;
  const errors = [];

  for (const file of files) {
    const relative = path.relative(SOURCE_DIR, file);
    const componentName = path.basename(file, path.extname(file));
    const outputFile = path.join(
      OUTPUT_DIR,
      relative.replace(/\.svg$/i, ".tsx")
    );

    try {
      const svg = fs.readFileSync(file, "utf8");

      const component = await transform(
        svg,
        {
          typescript: true,
          icon: true,
          plugins: ["@svgr/plugin-jsx"],
        },
        {
          componentName,
          filePath: file,
        }
      );

      fs.mkdirSync(path.dirname(outputFile), { recursive: true });
      fs.writeFileSync(outputFile, component, "utf8");

      converted++;

      if (converted % 100 === 0) {
        console.log(`Converted ${converted}/${files.length}`);
      }
    } catch (error) {
      errors.push({
        file: relative,
        error: error instanceof Error ? error.message : String(error),
      });

      console.error(`[ERROR] ${relative}: ${errors.at(-1).error}`);
    }
  }

  if (errors.length > 0) {
    fs.writeFileSync(
      path.resolve("conversion-errors.json"),
      JSON.stringify(errors, null, 2),
      "utf8"
    );
  }

  console.log("\nConversion finished.");
  console.log(`SVG files found: ${files.length}`);
  console.log(`Converted: ${converted}`);
  console.log(`Failed: ${errors.length}`);
  console.log(`Output: ${OUTPUT_DIR}`);

  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
