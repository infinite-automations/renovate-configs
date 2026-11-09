const assert = require("node:assert/strict");
const { moduleSuite } = require("./helpers.cjs");
const { contract, parameterized, verifyCoverage } = moduleSuite("pin");

contract("pin/semver", () => {
  const [rule] = parameterized("pin/semver", "package-name", "1").packageRules;
  assert.deepEqual(rule.matchPackageNames, ["package-name"]);
  assert.equal(rule.allowedVersions, "~1");
});
contract("pin/universal", () => {
  const [rule] = parameterized("pin/universal", "python", "3.11").packageRules;
  assert.deepEqual(rule.matchPackageNames, ["python"]);
  const pattern = new RegExp(rule.allowedVersions.slice(1, -1));
  for (const version of ["3.11", "3.11.9", "3.11-alpine"])
    assert.ok(pattern.test(version), version);
  for (const version of ["3.12", "3.110", "13.11"])
    assert.equal(pattern.test(version), false, version);
});

verifyCoverage();