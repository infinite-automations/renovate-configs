const assert = require("node:assert/strict");
const { moduleSuite, presets } = require("./helpers.cjs");
const { contract, verifyCoverage } = moduleSuite("minimumReleaseAge");

assert.equal(presets.default.minimumReleaseAge, "3 days");

contract("minimumReleaseAge/githubActions", (preset) => {
  assert.deepEqual(preset.packageRules[0].matchManagers, ["github-actions"]);
  assert.equal(preset.packageRules[0].minimumReleaseAge, "7 days");
});

for (const [name, types] of Object.entries({
  lockFileMaintenance: ["lockFileMaintenance"],
  digest: ["digest", "pinDigest"],
  pin: ["pin"],
  replacement: ["replacement"],
})) {
  contract(`minimumReleaseAge/${name}`, (preset) => {
    const [rule] = preset.packageRules;
    assert.deepEqual(rule.matchUpdateTypes, types);
    assert.equal(rule.minimumReleaseAge, null);
    assert.deepEqual(rule.addLabels, ["bypass-minimum-release-age"]);
    assert.equal(
      rule.rebaseWhen,
      name === "lockFileMaintenance" ? "conflicted" : undefined,
    );
  });
}

verifyCoverage();