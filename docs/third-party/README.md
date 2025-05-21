# Third-Party Documentation

This directory contains documentation references and definitions for third-party libraries, tools, and other external systems used by the CelesteMods project.

## Purpose

The documentation and definitions in this directory serve as a reference for developers working on the CelesteMods project, providing centralized access to information about external dependencies and related systems.

## Structure
- Each third-party entity has its own markdown file or subdirectory.
- Files follow the naming convention `[libraryName].md`.
- Subdirectories are used when a library has related libraries or components that depend on it.

## Format
- Each file follows this structure:
  - `## Documentation` Section:
    - Contains links to official documentation resources.
    - Each entry follows the format:
      ```
      ### Label
      #### Description
      - The description goes here.
      #### Link
      - The link goes here.
      ```
	- If the section is empty, omit it and the section header.
  - `## Definitions` Section:
    - Contains definitions related to the third-party entity.
    - Follows immediately after the Documentation section (if present).
	- If the section is empty, omit it and the section header.

## Contents

| File/Directory | Description |
|---------------|-------------|
| `celeste/` | Documentation related to the Celeste game and its modding ecosystem. |
| `githubCopilot/` | Documentation for GitHub Copilot customization. |
| `node/` | Documentation for Node.js and related tools. |
| `pino/` | Documentation for the Pino logging library. |
| `prismaORM/` | Documentation for the Prisma ORM database toolkit. |
| `reactjs/` | Documentation for React and related libraries. |