# GitHub Copilot Custom Instructions for CelesteMods Project

This document contains instructions for GitHub Copilot to follow when working with the CelesteMods project.

## Project Overview

CelesteMods is a website for listing, searching, and discovering Celeste mods. It is built using Next.js, React, and Prisma ORM with a MariaDB database.

## General Rules

### Prompt Processing
- When responding to a prompt, use the following numbered steps to process the main prompt and any other prompts that aren't standard reused prompts:
  1. Review the prompt for any spelling mistakes.
    - If any are found, stop and clarify with the user before fixing any of them - they may not actually be mistakes.
  2. Review the prompt for any instructions/information that appears contradictory.
     - If found, ask the user for clarification and stop processing.
     - If none found, continue.
  3. Review the prompt for any general rules (that apply beyond that specific prompt).
     - If any are found, add them to either the custom instructions file or a reusable prompt file that is referred to in the custom instructions file, and stop processing and allow the user to approve all changes before instructing you to continue.
     - If none are found, carry on.
  4. Review the prompt for definitions and process them according to the general rules for definitions.
    - If any files are created/updated, stop processing and allow the user to approve all changes before instructing you to continue.
  5. Review the prompt for third-party documentation and process it according the the general rules for third-party documentation.
    - If any files are created/updated, stop processing and allow the user to approve all changes before instructing you to continue.
  6. Evaluate the prompt to determine what specifications should exist before proceeding.
     - Review existing specifications.
     - Create/update specifications as required.
       - Specifications have only been added to the repository recently, so not all of the codebase is covered yet.
       - As a general rule, don't overcomplicate your changes by attempting to fix all specifications - only create or update the specifications that are relevant to the task at hand.
     - If any file changes were made, stop processing and allow the user to approve all changes before instructing you to continue.
  7. Proceed with the rest of the prompt.
     - Always check if there is a `Steps To Complete` section - follow these instructions if present.

### Definitions Processing
- All definitions listed in the "Definitions" section of a prompt should be transcribed in their own file.
  - Within `docs/definitions/` if it relates directly to this repository.
    - `docs/definitions/` should use the same file extension and sub-folder rules as `docs/third-party/`.
  - Definitions that relate to third-party libraries/tools/other software should be placed within a `## Definitions` section in the appropriate file within `docs/third-party/`.
- Definitions must be specific and clear.
  - If a definition does not meet those requirements, attempt to fix it.
  - Stop processing and ask the user for clarification if necessary.
- After putting all definitions in their files and making any required updates, stop processing and allow the user to approve all changes before instructing you to continue.

### Third-Party Documentation Processing
- Each third party (library, API, etc) should have its own file within `docs/third-party/`.
  - Each direct sub-section of the `Third Party Documentation` section of a prompt should be an individual third party.
- Sub-folders may be used if appropriate.
  - If sub-folder(s) is(are) needed for a library, then that library's file should be moved inside of its own folder along with the sub-folder(s).
  - Example hierarchy:
    - Library A is not used by any other library - its info should be in a file or subfolder within `docs/third-party/`.
    - Library B is only used by Library A - its info should be in a file or subfolder within Library A's folder.
    - Library C is only used by Library A - its info should be in a file or subfolder within Library A's folder.
    - Library D is only used by Library B - its info should be in a file or subfolder within Library B's folder.
    - Library E is not used by any other library - its info should be in a file or subfolder within `docs/third-party/`.
- After putting all third party documentation in their files and making any required updates, stop processing and allow the user to approve all changes before instructing you to continue.

### Documentation File
- File extension: `.md`
- File name: `[libraryName].md`
- The first section is `## Documentation`, if present.
  - If the section is empty, omit it and the section header.
  - There may be more than 1 entry under the Documentation header.
  - For third-party documentation:
    - An entry contains a link, with descriptions, to third-party documentation.
    - Each documentation link gets its own entry.
  - Each entry is nested directly under `## Documentation` and has the following format:
    `### Label`
	  `#### Description`
	    - The description goes here.
	  `#### Link`
	    - The link goes here.
- The second section is `## Definitions`, if present.
  - If the section is empty, omit it and the section header.
  - The `## Definitions` section, if it exists, should immediately follow the `## Documentation` section, if it exists.

### Specifications
- Specifications are used to document the functionality of files and folders in the repository.
- All specifications are defined in spec files within the specifications directory.
  - Specifications Directory: `docs/specifications/`

#### Specification Coverage
- All files and folders not excluded by `.gitignore` should be covered in a spec file, regardless of if there is a related README.
  - A file being "covered" by a specificaton means that the file's purpose is explained in a spec file.
  - Additionally, each of that file's functions/features should be covered by a specification.
- A related README should reference the relevant specification(s) instead of duplicating information.
  - The previous lines in this section notwithstanding, neither the `docs/` folder nor any of its contents (including subdirectories) should have specifications.
    - Their purposes should be explained in README files.
- For more details on specifications, see `docs/specifications/README.md`.

## Style Guidelines
- For style guidelines, refer to `.github/prompts/reusable/style.md`.