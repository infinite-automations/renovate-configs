const assert = require("node:assert/strict");
const { moduleSuite, prefix } = require("./helpers.cjs");
const { contract, verifyCoverage } = moduleSuite("default");

contract("default", (preset) => {
  assert.equal(preset.extends[0], "config:best-practices");
  for (const reference of [
    ":semanticCommits",
    "helpers:pinGitHubActionDigestsToSemver",
    ":automergeRequireAllStatusChecks",
    ":automergePr",
    ":rebaseStalePrs",
    ":enableVulnerabilityAlertsWithAdditionalLabel(security)",
  ]) {
    assert.ok(preset.extends.includes(reference), reference);
  }
  for (const name of [
    "githubActions",
    "lockFileMaintenance",
    "digest",
    "pin",
    "replacement",
  ]) {
    assert.ok(
      preset.extends.includes(`${prefix}:minimumReleaseAge/${name}`),
      name,
    );
  }
  assert.equal(preset.osvVulnerabilityAlerts, true);
  assert.equal(preset.minimumReleaseAge, "3 days");
  assert.equal(preset.internalChecksFilter, "strict");
  assert.equal(preset.platformAutomerge, true);
  assert.equal(preset.automergeStrategy, "squash");
});

verifyCoverage();