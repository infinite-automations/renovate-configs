const assert = require("node:assert/strict");
const { moduleSuite, prefix, presets } = require("./helpers.cjs");
const { contract, parameterized, verifyCoverage } =
  moduleSuite("semanticCommits");

for (const name of ["all", "datasource", "manager"]) {
  contract(`semanticCommits/${name}`, () => {
    const preset =
      name === "all"
        ? presets["semanticCommits/all"]
        : name === "datasource"
          ? parameterized("semanticCommits/datasource", "docker")
          : parameterized("semanticCommits/manager", "custom.regex", "tooling");
    for (const [update, type] of Object.entries({
      pin: "chore",
      pinDigest: "chore",
      patch: "fix",
      digest: "fix",
      minor: "feat",
      major: "feat",
    })) {
      const rule = preset.packageRules.find((candidate) =>
        candidate.matchUpdateTypes.includes(update),
      );
      assert.ok(rule, `Missing ${update} rule`);
      assert.equal(rule.semanticCommitType, type);
      assert.equal(
        rule.semanticCommitScope,
        name === "all" ? "deps" : name === "datasource" ? "docker" : "tooling",
      );
      assert.equal(
        rule.commitBody,
        update === "major"
          ? "BREAKING CHANGE: update {{depName}} to {{newValue}}"
          : undefined,
      );
      if (name === "datasource")
        assert.deepEqual(rule.matchDatasources, ["docker"]);
      if (name === "manager")
        assert.deepEqual(rule.matchManagers, ["custom.regex"]);
    }
  });
}

contract("semanticCommits/npmDependencies", (preset) => {
  const [rule] = preset.packageRules;
  assert.deepEqual(rule.matchManagers, ["npm"]);
  assert.deepEqual(rule.matchDepTypes, ["dependencies"]);
  assert.equal(rule.semanticCommitType, "fix");
  assert.equal(rule.semanticCommitScope, "deps");
});
for (const [name, paths] of Object.entries({
  devcontainer: ["**/.devcontainer/**"],
  tests: ["**/__tests__/**", "**/test/**", "**/tests/**", "**/__fixtures__/**"],
  examples: ["**/examples/**"],
})) {
  contract(`semanticCommits/${name}`, (preset) =>
    assert.deepEqual(
      preset.extends,
      paths.map((path) => `:pathSemanticCommitType(${path}, chore)`),
    ),
  );
}
contract("semanticCommits/nonProduction", (preset) =>
  assert.deepEqual(preset.extends, [
    `${prefix}:semanticCommits/devcontainer`,
    `${prefix}:semanticCommits/tests`,
    `${prefix}:semanticCommits/examples`,
  ]),
);
contract("semanticCommits/githubActions", (preset) => {
  assert.deepEqual(preset.packageRules[0].matchManagers, ["github-actions"]);
  assert.equal(preset.packageRules[0].semanticCommitType, "chore");
  assert.equal(preset.packageRules[0].semanticCommitScope, "deps");
});
contract("semanticCommits/fixDeps", (preset) => {
  assert.deepEqual(preset.packageRules[0].matchUpdateTypes, [
    "major",
    "minor",
    "patch",
    "digest",
    "lockFileMaintenance",
    "rollback",
    "bump",
    "replacement",
  ]);
  assert.deepEqual(preset.packageRules[1].matchUpdateTypes, [
    "pin",
    "pinDigest",
  ]);
  for (const [index, rule] of preset.packageRules.entries()) {
    assert.equal(rule.semanticCommitType, index === 0 ? "fix" : "chore");
    assert.equal(rule.semanticCommitScope, "deps");
    assert.equal(rule.commitBody, undefined);
  }
});
contract("semanticCommits/repoTooling", (preset) => {
  assert.deepEqual(preset.extends, [
    `${prefix}:semanticCommits/githubActions`,
    `${prefix}:semanticCommits/nonProduction`,
  ]);
  assert.deepEqual(preset.packageRules[0].matchManagers, [
    "devcontainer",
    "pre-commit",
    "mise",
    "asdf",
  ]);
  assert.deepEqual(preset.packageRules[1].matchDepTypes, [
    "devDependencies",
    "dev",
    "dev-dependencies",
  ]);
  for (const rule of preset.packageRules) {
    assert.equal(rule.semanticCommitType, "chore");
    assert.equal(rule.semanticCommitScope, "deps");
  }
});
contract("semanticCommits/fixDepsChoreTooling", (preset) =>
  assert.deepEqual(preset.extends, [
    `${prefix}:semanticCommits/fixDeps`,
    `${prefix}:semanticCommits/repoTooling`,
  ]),
);

verifyCoverage();