---
name: Node dependency setup
description: A Replit package-install callback failed while resolving this project's existing Node dependency tree.
---

The managed Node package installer failed with an npm Arborist `Cannot read properties of null (reading 'edgesOut')` error when asked to install the project's dependencies, while `npm ci --no-audit --no-fund` installed successfully from the existing lockfile.

**Why:** This is an environment-specific install behavior that is not visible from the project source.

**How to apply:** If the managed installer produces the same Arborist error for this project, try the deterministic lockfile install rather than changing dependency versions.
