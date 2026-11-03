import { readFile, writeFile } from "node:fs/promises";

const selected = process.argv[2];
if (!["web", "galactic"].includes(selected)) {
  console.error("Usage: node scripts/set-visual-theme.mjs web|galactic");
  process.exit(1);
}
const file = new URL("../lib/visual-theme.json", import.meta.url);
const configuration = JSON.parse(await readFile(file, "utf8"));
configuration.active = selected;
await writeFile(file, JSON.stringify(configuration, null, 2) + "\n");
console.log(`Visual theme: ${selected}. Rebuild or restart the preview to apply.`);
