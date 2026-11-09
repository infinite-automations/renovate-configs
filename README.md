# renovate-configs

Reusable, centrally maintained [Renovate](https://docs.renovatebot.com/) configuration presets.

## Available Configurations

### default.json

The general baseline extends Renovate's best practices, requires status checks for automerge, pins GitHub Action digests to semver, enables vulnerability alerts, applies a three-day minimum release age to releases (seven days for GitHub Actions), and uses squash platform automerge. It also retains the existing Renovate settings and Biome version manager.

The baseline includes all `minimumReleaseAge/*` presets. Those remain useful for configurations that do not extend `default`, or when composing a custom base.

### Automerge (`automerge.json`)

| Preset                  | Usage                             | Description                                                                        |
| ----------------------- | --------------------------------- | ---------------------------------------------------------------------------------- |
| `vulnerabilities`       | `automerge/vulnerabilities`       | Automerge vulnerability alert PRs.                                                 |
| `gitHubActions`         | `automerge/gitHubActions`         | Automerge GitHub Actions updates.                                                  |
| `disableBypassExternal` | `automerge/disableBypassExternal` | Disable automerge for lock file maintenance, digest, pin, and replacement updates. |

### Grouping (`group.json`)

| Preset               | Usage                            | Description                                                                               |
| -------------------- | -------------------------------- | ----------------------------------------------------------------------------------------- |
| `nonMajorByCategory` | `group/nonMajorByCategory(js)`   | Group minor and patch updates for a manager category. Extend after `group:allNonMajor`.   |
| `digestByCategory`   | `group/digestByCategory(docker)` | Group digest updates for a manager category separately. Extend after `group:allNonMajor`. |

### Minimum Release Age (`minimumReleaseAge.json`)

`githubActions` applies a seven-day minimum release age. `lockFileMaintenance`, `digest`, `pin`, and `replacement` bypass the age check for update types without usable release timestamps and label those updates `bypass-minimum-release-age`.

### Platform (`platform.json`)

`platform/disableAutomerge` selects Renovate's native merge, while `platform/squash` and `platform/rebase` choose the automerge strategy. `platform/squash` is already set by `default`; it remains available for other base configurations.

### Pinning (`pin.json`)

`pin/semver(package-name, 1)` constrains a package to a `~1` range. `pin/universal(package-name, 1.2)` constrains a package to a version prefix across datasources.

### Semantic Commits (`semanticCommits.json`)

| Preset                | Usage                                            | Description                                                                                                      |
| --------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `all`                 | `semanticCommits/all`                            | Set commit type by update type, scoped to `deps`.                                                                |
| `datasource`          | `semanticCommits/datasource(docker)`             | Apply the same policy scoped to a datasource.                                                                    |
| `manager`             | `semanticCommits/manager(custom.regex, tooling)` | Apply the policy scoped to a manager and chosen scope.                                                           |
| `npmDependencies`     | `semanticCommits/npmDependencies`                | Make runtime npm dependencies `fix(deps)` for all update types.                                                  |
| `devcontainer`        | `semanticCommits/devcontainer`                   | Keep devcontainer dependencies as `chore`.                                                                       |
| `tests`               | `semanticCommits/tests`                          | Keep test-only dependencies as `chore`.                                                                          |
| `examples`            | `semanticCommits/examples`                       | Keep example-only dependencies as `chore`.                                                                       |
| `nonProduction`       | `semanticCommits/nonProduction`                  | Combine devcontainer, test, and example path policies.                                                           |
| `githubActions`       | `semanticCommits/githubActions`                  | Make GitHub Actions updates `chore(deps)`.                                                                       |
| `fixDeps`             | `semanticCommits/fixDeps`                        | Make dependency updates `fix(deps)` and pin updates `chore(deps)`.                                               |
| `repoTooling`         | `semanticCommits/repoTooling`                    | Keep repository tooling and development dependencies `chore(deps)`. Extend after `fixDeps` or `semanticCommits`. |
| `fixDepsChoreTooling` | `semanticCommits/fixDepsChoreTooling`            | Combine `fixDeps` and `repoTooling` in order.                                                                    |

The built-in `:semanticCommits` is already in `default`. The custom `semanticCommits/all` adds explicit per-update rules, including a major-update `BREAKING CHANGE` body, and is intended for use instead of that built-in when this behavior is preferred.

### Custom Managers (`customManagers.json`)

| Preset                 | Usage                                                    | Description                                                                     |
| ---------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `regexManager`         | `customManagers/regexManager(filePatterns, matchString)` | Reusable regex manager with captured/default versioning support.                |
| `commentManager`       | `customManagers/commentManager(filePatterns)`            | Parse annotated YAML or shell values, including image tags and SHA-256 digests. |
| `workflowVersionPin`   | `customManagers/workflowVersionPin`                      | Apply comment-based version tracking to GitHub Actions workflow files.          |
| `dockerfileArgVersion` | `customManagers/dockerfileArgVersion`                    | Apply comment-based version tracking to Dockerfile ARG values.                  |

`commentManager` also tracks annotated npm `package@version` lines, including
scoped packages. When using these inside a YAML block scalar, strip comment
lines before passing the list to tools that expect only package specifications.

```yaml
extra-plugins: |
  # renovate: datasource=npm depName=semantic-release-major-tag
  semantic-release-major-tag@0.3.2
```

## Usage

To use these configurations in your repository, reference them directly from this GitHub repository in your `renovate.json`:

```json
{
  "extends": ["github>infinite-automations/renovate-configs"]
}
```

Composable presets can also be combined directly:

```json
{
  "extends": [
    "github>infinite-automations/renovate-configs:semanticCommits/all",
    "github>infinite-automations/renovate-configs:group/nonMajorByCategory(js)"
  ]
}
```

You can also pin to a specific release version:

```json
{
  "extends": ["github>infinite-automations/renovate-configs:default#v1.2.0"]
}
```

This repository provides composable policy building blocks rather than organization-specific registry rules or language/application-specific full configurations.

## Release Workflow

This repository includes a GitHub Actions workflow that:

- Lints code on push and pull requests to main using SuperLinter
- Automatically creates GitHub releases using Semantic Release with a GitHub App token
- Configs are directly usable from GitHub releases without npm
