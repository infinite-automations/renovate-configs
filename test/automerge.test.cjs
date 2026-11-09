const assert = require("node:assert/strict");
const { moduleSuite } = require("./helpers.cjs");
const { contract, verifyCoverage } = moduleSuite("automerge");

contract("automerge/vulnerabilities", (preset) =>
  assert.equal(preset.vulnerabilityAlerts.automerge, true),
);
contract("automerge/gitHubActions", (preset) => {
  assert.deepEqual(preset.packageRules[0].matchManagers, ["github-actions"]);
  assert.equal(preset.packageRules[0].automerge, true);
});
contract("automerge/disableBypassExternal", (preset) => {
  assert.deepEqual(
    preset.packageRules.flatMap((rule) => rule.matchUpdateTypes),
    ["lockFileMaintenance", "digest", "pinDigest", "pin", "replacement"],
  );
  for (const rule of preset.packageRules) assert.equal(rule.automerge, false);
});

verifyCoverage();