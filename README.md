# renovate-configs

Configurations for renovate

## Available Configurations

### default.json

Basic renovate config with:
- Dependency dashboard enabled
- Automerge enabled with status checks
- Platform automerge enabled
- Automerge strategy: squash
- Automerge via PR

### automerge-patch.json

Extends the default config and enables automerge for patch updates.

### automerge-minor.json

Extends the default config and enables automerge for minor updates.

### automerge-major.json

Extends the default config and enables automerge for major updates.

## Usage

To use these configurations in your repository, add the following to your `renovate.json`:

```json
{
  "extends": ["local>infinite-automations/renovate-configs:default"]
}
```

Or for specific automerge behavior:

```json
{
  "extends": ["local>infinite-automations/renovate-configs:automerge-patch"]
}
```

## Release Workflow

This repository includes a GitHub Actions workflow that:
- Lints code on push and pull requests to main using SuperLinter
- Automatically releases new versions using Semantic Release with a GitHub App token
