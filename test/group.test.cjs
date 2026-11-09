const assert = require("node:assert/strict");
const { moduleSuite } = require("./helpers.cjs");
const { contract, parameterized, verifyCoverage } = moduleSuite("group");

for (const [name, types, label] of [
  ["nonMajorByCategory", ["minor", "patch"], "non-major dependencies"],
  ["digestByCategory", ["digest", "pinDigest"], "digests"],
]) {
  contract(`group/${name}`, () => {
    for (const category of ["ci", "js", "docker"]) {
      const [rule] = parameterized(`group/${name}`, category).packageRules;
      assert.deepEqual(rule.matchCategories, [category]);
      assert.deepEqual(rule.matchUpdateTypes, types);
      assert.equal(rule.groupName, `${category} ${label}`);
    }
  });
}

verifyCoverage();