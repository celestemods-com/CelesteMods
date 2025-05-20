# Style Guidelines for CelesteMods Project

This document contains style guidelines for the CelesteMods project.

## Documentation Style
- Generally, file/folder names should be in `camelCase` not `PascalCase`.
  - When file/folder names affect routing, use `kebab-case`.
- For all files, don't leave an empty line at the end of the file.
- For prose (comments/documentation/etc, not code):
  - Use proper title/sentence capitalization.
  - Use Oxford commas.
  - Always use proper punctuation at the end of sentences.
  - All punctuation, including commas and periods, should go outside of closing quotation marks ("British style").

### First Party Documentation
- Documentation for this project should be clear, concise, and easy to understand.
- Documentation should be written mostly in prose, but code snippets may be included where appropriate.

### Third Party Documentation
- When referencing third-party documentation, provide direct links where possible.
- Organize third-party documentation based on the dependency hierarchy.

### Specific File Types
- These rules are additive with the other rules under `## Documentation Style`, but, if there is a conflict, these rules take precedence.
- The first bullet point for each file type should always be the file extension or file name.
- The second bullet point for each file type should always specify the parent guidelines, if applicable.
- If a set of guidelines conflicts with its parent guidelines, the child guidelines shall take precedence. For example, Prompt File guidelines would take precendence over Markdown File guidelines.

#### Markdown Files
- File extension: `.md`
- A heading should always be preceeded by an empty line, except for at the beginning of the file.
- A heading may be followed by bullet points, normal lines of prose, or directly by sub-headings.
  - Don't mix bullet points and normal prose under a single heading.
    - No empty line between a heading and a bullet point.
    - One empty line between a heading and normal prose.
  - Generally, prefer bullet points over normal prose.
    - Use `-` for bullet points, not `*`.
  - The bullet points/normal prose may be followed by an empty line then by sub-headings.

#### Prompt Files
- File extension: `.prompt.md`
- Prompt files are a subset of markdown files and follow all markdown file guidelines.
- Prompt files count as "prose", not "code."

#### README Files
- File name is always: `README.md`
- README files are a subset of markdown files and follow all markdown file guidelines.

## Code Style
- Prefer double quotes over single quotes.
- Prefer tabs over spaces for whitespace in code.
- One level of indentation is 2 spaces.

### Variable Names
- Prefer pure `camelCase`.
- Use `camelCase_mixed_with_snakeCase` when required.
- Contant values hard-coded in source code should be in all-caps `SNAKE_CASE`.

### Types
- Always use a typescript file extension (`.ts`,`.tsx`,`.cts`,`.mts`) instead of a javascript file extension (`.js`,`.jsx`,`.cjs`,`.mjs`) unless doing so causes an issue.
- Inferred types are acceptable as long as they are sufficiently descriptive, but no variable should ever be left with the `any` type.
- Where possible, use types and intersections for object types instead of interfaces.

### React Components Code
- Always use functional components and hooks instead of class components.
- Component function names must be in `PascalCase`.

## UI Style
- Follow the design patterns established in the mockups.
- Use Mantine components where appropriate.
- Ensure consistent styling across the application.