# Release Process

This document describes how to create a new release for StreakHub Card.

## Prerequisites

- All changes are merged to `main` branch
- Build passes without errors (`npm run build`)
- Changes have been tested in Home Assistant

## Steps

### 1. Update Version

Update the version in `package.json`:

```json
{
  "version": "X.Y.Z"
}
```

Use semantic versioning:
- **MAJOR** (X): Breaking changes
- **MINOR** (Y): New features, backward compatible
- **PATCH** (Z): Bug fixes, backward compatible

### 2. Update Release Notes

Add a new section at the top of `RELEASENOTES.md`:

```markdown
# vX.Y.Z

### ✨ New Features
- Feature description

### 🐞 Bug Fixes
- Fix description

### 🔧 Infrastructure
- Infrastructure change

### 📝 Documentation
- Documentation update

**Full Changelog**: https://github.com/moerk-o/streakhub-card/compare/vPREVIOUS...vX.Y.Z

---
```

Use only the sections that apply to your release.

### 3. Build

```bash
npm run build
```

Verify the output in `dist/streakhub-card.js`.

### 4. Commit

```bash
git add package.json RELEASENOTES.md
git commit -m "chore: bump version to vX.Y.Z"
git push origin main
```

### 5. Create GitHub Release

1. Go to [Releases](https://github.com/moerk-o/streakhub-card/releases)
2. Click "Draft a new release"
3. Create a new tag: `vX.Y.Z`
4. Title: `vX.Y.Z`
5. Copy the release notes from `RELEASENOTES.md` (only the current version section)
6. Click "Publish release"

The GitHub Actions workflow will automatically build and attach `streakhub-card.js` to the release.

### 6. Verify

- Check that the release appears on GitHub
- Verify the attached asset can be downloaded
- Test installation in Home Assistant

## Release Workflow (GitHub Actions)

The project uses a GitHub Actions workflow (`.github/workflows/release.yml`) that automatically:
- Triggers when a release is published
- Attaches the built `streakhub-card.js` to the release

This allows HACS and manual installations to download the card directly from releases.

## Version History

All releases are documented in [RELEASENOTES.md](RELEASENOTES.md).
