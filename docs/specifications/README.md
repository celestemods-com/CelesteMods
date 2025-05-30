# Specifications

This directory contains specification files that document the functionality of files, folders, and features in the CelesteMods repository.

## Purpose
- Specifications serve as comprehensive documentation of:
  - File and folder structures
  - Feature behaviors
  - System architecture
  - Use cases and workflows
- Specifications should prescriptively describe the details of the feature/function/etc.
- These specifications help developers understand how the system works and provide a reference for implementation.
- Each function/feature of the Nextjs application should typically be covered by one specification.
- A specification can also be used to describe the function of any file or folder in this repository.

## File Structure
- The directory structure within `docs/specifications/` mirrors the repository root structure.
- All files and folders not excluded by `.gitignore` should be covered by a specification, other than the following exception:
  - Neither the `docs/` folder nor any of its contents have specifications; their purposes are explained in README files.
- A file being "covered" by a specification means that:
  - The file's purpose is explained in a spec file.
  - Each of that file's functions/features is covered by a specification.
- A related README should reference the relevant specification(s) instead of duplicating information.

## Coverage
- Directory/File Coverage:
  - All files and folders not excluded by `.gitignore` should be covered in a spec file.
- Specification Coverage:
  - Each feature of the Nextjs server should be described in a specification.
  - If a file or directory outside of the `src/` directory is included in the Directory/File Coverage section, their features should be described in specifications.
  - Avoid information duplication:
    - If there is a README, include its information in the specification and refer to it from the README.
    - If there is a config file, summarize what it's for and any general guiding principles/other notes related to how it was configured in the specification, and then reference the specification in comments in the config file, if possible.

## Specification File Format

### File Naming
- All specification files end with `.spec.md`.
- Each directory should have a spec file named `specifications.spec.md`.
  - This spec file must contain names and descriptions for every file and subdirectory.
  - By default, this spec file will contain a `File` entry within the `Files` section for each file.
  - If the spec file grows too complicated, split any subdirectory files into their own spec file within the appropriate subdirectory.
  - If the spec file still grows too complicated, remove the `Files` section and give each file its own spec file.
- Individual file specifications follow the format `[filename].spec.md`.
  - If possible, ignore the file extension of the original file(s).
  - If required for clarity, include the file extension of the original file in `[filename]`.

### File Sections

Specification files have two main sections:

#### Directories Section

```markdown
# Directories

## [Directory Name]
- [Directory description]
```

- Only included if there are subdirectories
- Each directory is an H2 heading
- Directory descriptions are bullet points

#### Files Section

```markdown
# Files

## [Filename]
- [File description]
- [Additional specifications if needed]
```

- Lists all files in the current directory
- Each file has its own H2 heading
- File descriptions and specifications are bullet points


### When to Split Spec Files
- Start with a single spec file for the root directory and split it only when required.
- Split a spec file when any of the following apply:
  - If there is more than one subdirectory, none of their files may be included in `Files`.
  - If there is exactly one subdirectory, but it contains at least one subdirectory of its own, none of its files may be included in `Files`.
  - A spec file becomes too complex.
- If there is exactly one subdirectory with no subdirectories of its own:
  - All of its files may be included in `Files`, or none of them may be included.
  - Generally, no files should be included.
    - Only include the files for simple subdirectories.
    - A balance should be kept between reducing the complexity of a given spec file and the added developer burden/cognitive load of having more spec files.
  - Either way, the directory should be listed in `Directories`.
    - The directory's bullet point's first child should be a bullet point giving its description.
    - If the directory's files are included, the subsequent bullet points should list the names of the files in the form `[directory name]/[file name]`.


## Individual Specification Format

Each feature or function specification follows this structure and is considered sequentially:

```markdown
### [Specification Name]

[One-sentence description]

Tags: [tag1], [tag2]

[Optional context steps]

#### [Scenario Name]
[Scenario description]

  Tags: [tag1], [tag2]
- [Step 1]
- [Step 2]
...

[Optional teardown steps]
```

### Specification Structure
- Descriptive Specification Name
  - H3 (### not underlines)
  - No indentation
- Empty Line
- Specification Description
  - One sentence, if possible
  - No indentation
  - Not a bullet point
- Empty Line
- Specification-Level Tags
  - Format described in the Tags section below
- Empty Line
- Optional: Context Steps
  - Format described in the Steps section below
- Empty Line(s)
  - One empty line if there are no context steps
  - Two empty lines if there are context steps
- Scenarios
  - Must be at least one scenario per specification
  - Must be one empty line between the last step of a scenario and the title of the next scenario
- Optional: Teardown Steps
  - Format described in the Steps section below

### Scenario Structure
- Each scenario represents a single flow in a particular specification.
- Considered sequentially.
- Structure:
  - Descriptive Scenario Name
    - H4 with two-space indentation
  - Scenario Description
    - One sentence, if possible
    - Two-space indentation
    - Not a bullet point
  - Empty Line
  - Scenario-Level Tags
    - Format described in the Tags section below
  - Scenario Steps
    - Must be at least one step per scenario
    - Format described in the Steps section below

### Tags
- Tags help categorize and filter specifications:
  - Indentation:
    - Specification tags are not indented
    - Scenario tags are indented with two spaces
  - Format: A single line that starts with "Tags:" followed by the list of tags
    - Each tag is preceded by a space
    - Tags are separated by a comma (and the space preceding the second tag)
    - Tags must be all lowercase
    - Each tag must be a single word

### Steps
- Each step contains a single instruction or describes a single piece of state.
- One step per bullet point.
  - More detail may be added with one level of indented bullet points.
- Steps are considered sequentially.
- There are 3 different types of steps:

#### Context Steps
- Steps declared between a specification description and the first scenario name are context steps.
- Optional section.
- Specify any states or sets of conditions that are necessary for executing the specification's scenarios.
- Considered before each of the specification's scenarios.

Examples:
```markdown
- User is logged in as "mike"
  - If required, sign up for user "mike"
  - If required, log in as "mike"
- Navigate to the project page
```

#### Scenario Steps
- Steps declared with a scenario are scenario steps.

Examples:
```markdown
- Delete the "example" project
- Ensure the "example" project has been deleted
```

#### Teardown Steps
- The start of the repeating teardown steps is indicated with a line containing three consecutive underscores.
  - Subsequent steps are repeating teardown steps.
  - Optional section.
  - Specify any clean-up steps required after every scenario in the specification.
  - Considered after each of the specification's scenarios.
- The start of the final teardown steps is indicated with a line containing seven consecutive underscores.
  - Subsequent steps are final teardown steps.
  - Optional section.
  - Specify any clean-up steps required after consideration of the final scenario and the subsequent repeating teardown steps.
  - Considered only after the final scenario and the subsequent repeating teardown steps.

Examples:
```markdown
___
- Logout user "mike"
- Delete user "mike"

_______
- Clean up any remaining resources
```


## Contents

| File/Directory | Description |
|----------------|-------------|
| `specifications.spec.md` | Root level specifications |