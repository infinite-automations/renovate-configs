const assert = require("node:assert/strict");
const { test } = require("node:test");
const { moduleSuite, parameterized } = require("./helpers.cjs");
const { contract, verifyCoverage } = moduleSuite("customManagers");

const presets = require("../customManagers.json");
const marker = "customManagers/regexManager({{arg0}}, ";
function regexFrom(reference) {
  const start = reference.indexOf(marker);
  assert.notEqual(start, -1);
  return reference.slice(start + marker.length, -1);
}

const versionPattern = regexFrom(presets.commentManager.extends[0]);
const imagePattern = regexFrom(presets.commentManager.extends[1]);
const digest = `sha256:${"a".repeat(64)}`;

contract("customManagers/regexManager", () => {
  const [manager] = parameterized(
    "customManagers/regexManager",
    "/^action\\.ya?ml$/",
    "VERSION=(?<currentValue>[^\\s]+)",
  ).customManagers;
  assert.deepEqual(manager.managerFilePatterns, ["/^action\\.ya?ml$/"]);
  assert.deepEqual(manager.matchStrings, ["VERSION=(?<currentValue>[^\\s]+)"]);
  assert.match(manager.versioningTemplate, /defaultVersioning/);
});

contract("customManagers/commentManager", () => {
  for (const quote of ["", "'", '"']) {
    for (const separator of ["\n", "\r\n"]) {
      for (const ending of ["\n", ""]) {
        const source = `# renovate: datasource=docker depName=example/image${separator}VERSION: ${quote}1.2.3@${digest}${quote}${ending}`;
        const match = new RegExp(versionPattern).exec(source);
        assert.ok(match, JSON.stringify(source));
        assert.equal(match.groups.datasource, "docker");
        assert.equal(match.groups.depName, "example/image");
        assert.equal(match.groups.currentValue, "1.2.3");
        assert.equal(match.groups.currentDigest, digest);
      }
    }
  }

  const annotated =
    "  # renovate: datasource=helm depName=example registryUrl=https://charts.example.com extractVersion=^v(?<version>.*)$ versioning=semver\n  VERSION: v1.2.3\n";
  const match = new RegExp(versionPattern).exec(annotated);
  assert.ok(match);
  assert.equal(match.groups.registryUrl, "https://charts.example.com");
  assert.equal(match.groups.extractVersion, "^v(?<version>.*)$");
  assert.equal(match.groups.versioning, "semver");
  assert.equal(match.groups.currentValue, "v1.2.3");
});

test("commentManager does not consume a following annotation", () => {
  const source =
    "# renovate: datasource=npm depName=first\nFIRST=1.2.3\n# renovate: datasource=npm depName=second\nSECOND=4.5.6\n";
  const matches = [...source.matchAll(new RegExp(versionPattern, "g"))];
  assert.deepEqual(
    matches.map((match) => match.groups.depName),
    ["first", "second"],
  );
});

test("docker image comments extract image tags, digests, and registry ports", () => {
  const image = "registry.example.com:5000/team/image";
  const source = `# renovate: datasource=docker depName=${image} format=docker-image depType=dev registryUrl=https://registry.example.com\r\nIMAGE: "${image}:3.11@${digest}"\r\n`;
  const match = new RegExp(imagePattern).exec(source);
  assert.ok(match);
  assert.equal(match.groups.depName, image);
  assert.equal(match.groups.currentValue, "3.11");
  assert.equal(match.groups.currentDigest, digest);
  assert.equal(match.groups.depType, "dev");
  assert.equal(match.groups.registryUrl, "https://registry.example.com");
  assert.equal(match.groups.defaultVersioning, "docker");
});

contract("customManagers/workflowVersionPin", (preset) => {
  const reference = preset.extends[0];
  const start = reference.indexOf("commentManager(") + "commentManager(".length;
  const expression = new RegExp(reference.slice(start, -1).slice(1, -1));
  assert.ok(expression.test(".github/workflows/build.yml"));
  assert.ok(expression.test(".github/workflows/build.yaml"));
  assert.equal(expression.test("action.yml"), false);
});

contract("customManagers/dockerfileArgVersion", (preset) => {
  const reference = preset.extends[0];
  const start = reference.indexOf("commentManager(") + "commentManager(".length;
  const expression = new RegExp(reference.slice(start, -1).slice(1, -1));
  assert.ok(expression.test("Dockerfile"));
  assert.ok(expression.test("services/api/Containerfile.prod"));
  assert.equal(expression.test("src/index.js"), false);
});

verifyCoverage();