# renovate-configs

Configurations for renovate

## Available Configurations

### default.json

Basic renovate config with:

- Dependency dashboard enabled
- Automerge settings configured (platformAutomerge, strategy: squash, via PR)
- Status checks: null (no required checks)
- Automerge behavior controlled by extending configs

### automerge-patch.json

Extends the default config and enables automerge for patch updates only.

### automerge-minor.json

Extends the default config and enables automerge for minor updates only.

### automerge-major.json

Extends the default config and enables automerge for major updates only.

## Usage

To use these configurations in your repository, reference them directly from this GitHub repository in your `renovate.json`:

```json
{
  "extends": ["github>infinite-automations/renovate-configs:default"]
}
```

Or for specific automerge behavior:

```json
{
  "extends": ["github>infinite-automations/renovate-configs:automerge-patch"]
}
```

You can also pin to a specific release version:

```json
{
  "extends": ["github>infinite-automations/renovate-configs:default#v0.0.0"]
}
```

## Release Workflow

This repository includes a GitHub Actions workflow that:

- Lints code on push and pull requests to main using SuperLinter
- Automatically creates GitHub releases using Semantic Release with a GitHub App token
- Configs are directly usable from GitHub releases without npm
