# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2025-12-30
### Added
- Allow optional image blocks in templates via presence-based guards (`if / endif`)
- Reconfigure template to conditionally render brand and product logos

## [0.1.0] - 2025-12-29
### Added
- Initial Virgil specification for build-time artifact generation
- Support for Open Graph image generation via headless Chromium (Playwright)
- Deterministic OG image rendering from HTML/CSS templates
- Cache-busted asset filenames for safe static deployment
- `virgil.manifest.json` output mapping stable IDs to generated artifacts
- Brand and product configuration support (name, color, version)
- Page metadata support for OG images (title, URL, description)

### Notes
- This release establishes Virgil’s core philosophy: deterministic, build-time artifact generation with no runtime dependencies
- Template rendering supports static variable substitution only (no logic or control flow)
