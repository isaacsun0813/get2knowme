import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import validator from "gltf-validator";

const files = process.argv.slice(2);
if (!files.length) {
  for (const file of await readdir("public/models")) {
    if (file.endsWith(".glb")) files.push(path.join("public/models", file));
  }
}
if (!files.length) throw new Error("No GLB files found");

let errors = 0;
for (const file of files) {
  const bytes = await readFile(file);
  const result = await validator.validateBytes(new Uint8Array(bytes), {
    uri: path.basename(file),
  });
  console.log(
    `${file}: ${(bytes.length / 1024).toFixed(0)} KiB; ${result.issues.numErrors} errors; ${result.issues.numWarnings} warnings`,
  );
  for (const issue of result.issues.messages.filter(
    (issue) => issue.severity <= 1,
  )) {
    console.log(`  ${issue.code}: ${issue.message} ${issue.pointer || ""}`);
  }
  errors += result.issues.numErrors;
}
if (errors) process.exitCode = 1;
