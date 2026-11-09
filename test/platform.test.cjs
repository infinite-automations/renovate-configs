const assert = require("node:assert/strict");
const { moduleSuite } = require("./helpers.cjs");
const { contract, verifyCoverage } = moduleSuite("platform");

contract("platform/disableAutomerge", (preset) =>
  assert.equal(preset.platformAutomerge, false),
);
for (const strategy of ["squash", "rebase"]) {
  contract(`platform/${strategy}`, (preset) =>
    assert.equal(preset.automergeStrategy, strategy),
  );
}

verifyCoverage();