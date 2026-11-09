const assert = require("node:assert/strict");
const { readdirSync, readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { test } = require("node:test");
const { documents, prefix } = require("./helpers.cjs");

const root = resolve(__dirname, "..");

test("every public preset reference resolves to an exported preset", () => {
  function visit(value, source) {
    if (Array.isArray(value)) return value.forEach((item) => visit(item, source));
    if (value && typeof value === "object")
      return Object.values(value).forEach((item) => visit(item, source));
    if (typeof value !== "string" || !value.startsWith(`${prefix}:`)) return;

    const presetName = value.slice(prefix.length + 1).split("(")[0];
    const [moduleName, ...presetPath] = presetName.split("/");
    let preset = documents[moduleName];
    for (const part of presetPath) preset = preset && preset[part];
    assert.notEqual(preset, undefined, `${source} references ${presetName}`);
  }

  for (const [name, document] of Object.entries(documents)) visit(document, name);
});

test("public presets contain no organization-specific or full-stack configs", () => {
  const files = readdirSync(root).filter(
    (name) => name.endsWith(".json") && !name.startsWith("."),
  );
  const forbidden =
    /liebherr|nexus\.|registries\/internal|ociArtifactLockfile|dotnetFullStack|pythonApplication|pythonLibrary|config\/(python|dotnet)/i;
  for (const name of files) {
    const content = readFileSync(resolve(root, name), "utf8");
    assert.doesNotMatch(content, forbidden, name);
  }
});