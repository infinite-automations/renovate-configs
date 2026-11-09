const assert = require("node:assert/strict");
const { readdirSync, readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { test } = require("node:test");

const root = resolve(__dirname, "..");
const documents = Object.fromEntries(
  readdirSync(root)
    .filter((name) => name.endsWith(".json") && !name.startsWith("."))
    .map((name) => [
      name.slice(0, -5),
      JSON.parse(readFileSync(resolve(root, name), "utf8")),
    ]),
);
const presets = { default: documents.default };
for (const [moduleName, document] of Object.entries(documents)) {
  if (!["default", "renovate"].includes(moduleName)) {
    for (const [name, preset] of Object.entries(document))
      presets[`${moduleName}/${name}`] = preset;
  }
}
const prefix = "github>infinite-automations/renovate-configs";

function parameterized(name, ...argumentsList) {
  return JSON.parse(
    JSON.stringify(presets[name]).replace(/\{\{arg(\d+)\}\}/g, (_, index) => {
      assert.ok(
        index < argumentsList.length,
        `Missing argument ${index} for ${name}`,
      );
      return JSON.stringify(argumentsList[index]).slice(1, -1);
    }),
  );
}

function moduleSuite(moduleName) {
  const expected = Object.keys(presets).filter(
    (name) => name === moduleName || name.startsWith(`${moduleName}/`),
  );
  assert.ok(expected.length > 0, `Unknown preset module: ${moduleName}`);
  const covered = new Set();

  function contract(name, check) {
    assert.ok(
      expected.includes(name),
      `Unknown preset in ${moduleName}: ${name}`,
    );
    assert.ok(!covered.has(name), `Duplicate contract: ${name}`);
    covered.add(name);
    test(`${name}: policy contract`, () => check(presets[name]));
  }

  function verifyCoverage() {
    test(`${moduleName}: every exported preset has a contract`, () => {
      assert.deepEqual([...covered].sort(), expected.sort());
    });
  }

  return { contract, parameterized, verifyCoverage };
}

module.exports = { documents, presets, prefix, parameterized, moduleSuite };