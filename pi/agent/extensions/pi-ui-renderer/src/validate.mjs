#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const cli = join(root, "src/cli.mjs");
const extensionsDir = join(root, "..");

function run(fixture) {
  return execFileSync(process.execPath, [cli, join(root, "fixtures", fixture), "--extensions-dir", extensionsDir], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function assertContains(name, output, needle) {
  if (!output.includes(needle)) {
    console.error(`Validation failed: ${name} output did not contain ${JSON.stringify(needle)}`);
    console.error("--- output ---");
    console.error(output);
    process.exit(1);
  }
}

const assistant = run("assistant-message.json");
assertContains("assistant message", assistant, "AGENT");
assertContains("assistant message", assistant, "┃");
assertContains("assistant message", assistant, "╱╱╱");

const bash = run("bash-execute.json");
assertContains("bash tool", bash, "Run");
assertContains("bash tool", bash, "hello from pi-ui-render");

console.error("pi-ui-render validation passed");
