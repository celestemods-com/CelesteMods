# Specifications

This directory contains specification files that document the functionality of files, folders, and features in the Celeste Mods List repository.

## Purpose
- Specifications serve as comprehensive documentation of:
  - File and folder structures/purposes
  - Feature behaviors
  - System architecture
- Specifications should prescriptively describe the details of the feature/function/etc.
- These specifications help developers understand how the system works and provide a reference for implementation.

## File and Folder Structure
- Specification files are kept within the specifications directory.
  - Specifications Directory: `docs/specifications/`
- The directory structure within the specifications directory mirrors the repository root structure.

## Coverage
- Directory/File Coverage:
  - Each feature of the Nextjs server should be described in a specification.
  - All files and folders not excluded by `.gitignore` should be covered by at least one specification.
    - Start with a single spec file for the root directory and split it (or its children) only when required.
      - See `### When to Split Spec Files`.
  - Exceptions:
    - Neither the `docs/` folder nor any of its contents have specifications; their purposes are explained in README files.
- A file being "covered" by a specification means that:
  - The file's purpose is explained in a specification.
  - Each of that file's functions/features is covered by a specification.
- Avoid information duplication:
  - If a specification is created for file(s)/folder(s) that is(are) already covered by a README, the specification will contain all required information (without considering the README), and the README will then be updated to remove duplicated information and refer to the specification as needed.
  - If there is a config file, summarize what it's for and any general guiding principles/other notes related to how it was configured in the specification, and then reference the specification in comments in the config file, if possible.

## Specification File Format

### File Naming
- File Extension: `.spec.md`.
- Each directory should have a spec file named `specifications.spec.md`.
  - This spec file must contain names and descriptions for every file and subdirectory.
  - By default, this spec file will contain a `File` entry within the `Files` section for each file.
    - If the spec file grows too complicated, split any subdirectory files into their own spec file within the appropriate subdirectory.
    - If the spec file still grows too complicated, remove the `Files` section and give each file its own spec file.
- Individual file spec files are named following the format `[filename].spec.md`.
  - If possible, ignore the file extension of the original file(s).
  - If required for clarity, include the file extension of the original file in `[filename]`.

### File Sections
- Specification files have the following main sections:

#### Directories Section
- The section header will be an H1 heading using `#` instead of underlines.
  - `# Directories`
- Contains the names and descriptions of all direct-child subdirectories.
  - This section is omitted if there are no subdirectories.
- Each directory name is an H2 heading.
  - Use `##` instead of underlines.
  - No indentation.
- A single bullet point nested one level under each directory name will contain that directory's description.

#### Files Section
- The section header will be an H1 heading using `#` instead of underlines.
  - `# Files`
- Lists all files in the current directory.
- Each file name (including file extension) in the relevant directory must be listed as an H2 heading.
  - Use `##` instead of underlines.
  - No indentation.
- The first bullet point nested one level under each file name will contain that file's description.
- If a file does not have its own spec file, then its specification(s) will be listed following its description.
  - A single empty line will separate the description and the first specification.
  - Specifications shall also be separated from each other by a single empty line.
- If a file does have its own spec file, then only its name and description will be included in `Files`.

#### Common Specifications Section
- The section header will be an H1 heading using `#` instead of underlines.
  - `# Common Specifications`
- This section (if present) appears after the `Files` section.
  - This section is omitted if there are no common specifications.
  - This section is only used in a `specifications.spec.md` file, never in a file-specific spec file.
- Contains specifications for functions/features that cross between multiple files.
- Each common specification will be an H2 heading.
  - Use `##` instead of underlines.
  - Normal specification indentation.
- The scenarios under common specifications will be H3 headings.
  - Use `###` instead of underlines.
  - Normal scenario indentation.


### Where to Include Specifications
- Single File Specifications:
  - A specification that describes a single file and/or a function/feature that is only relevant to a single file.
  - If the file doesn't have its own spec file, nest the specification under that file in the `Files` section.
  - If the file does have its own dedicated spec file, include the specification there.
- Common Specifications:
  - A specification describing a function/feature that crosses between multiple files.
  - Add common specifications to the `# Common Specifications` section in the `specifications.spec.md` file for the closest common parent directory.

### When to Split Spec Files
- Split a spec file when any of the following apply:
  - If there is more than one subdirectory.
  - If there is exactly one subdirectory, but it contains at least one subdirectory of its own.
  - A spec file becomes too complex.
    - A balance must be kept between reducing the complexity of a given spec file and the added developer cognitive load of having more spec files to hold in their head.
  - If any file included in `Files` requires more than one specification, split that file out into its own spec file.
    - If any file from the spec file's directory is split into its own spec file, then no files from any subdirectories may be included in `Files`.
- If there is exactly one subdirectory with no subdirectories of its own:
  - Either all of its files may be included in `Files`, or none of them may be included.
    - If the directory's files are included, the subsequent bullet points should list the names of the files in the form `[directory name]/[file name]`.
  - Generally, no files should be included.
    - Only include the files for simple subdirectories.
  - Either way, the directory should be listed in `Directories`.


## Individual Specification Format
- Each specification represents a single function/feature of the Nextjs application.
- Each specification is considered sequentially.
- Each specification follows this structure:

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

#### [Scenario Name]
[Scenario description]

  Tags: [tag3], [tag4]

- [Step 1]
- [Step 2]

[Optional teardown steps]
```

### Specification Structure
- Descriptive Specification Name
  - H3 heading.
    - `###` not underlines.
  - No indentation.
- Empty Line
- Specification Description
  - One sentence, if possible.
  - No indentation.
  - Not a bullet point.
- Empty Line
- Specification-Level Tags
  - Format described in the `Tags` section below.
- Empty Line
- Optional: Context Steps
  - Format described in the `Steps` section below.
- Empty Line(s)
  - There must always be two empty lines before the first scenario name, whether or not there are context steps.
- Scenarios
  - Each specification must contain at least one scenario.
  - Must be one empty line between the last step of a scenario and the title of the next scenario.
- Empty Line
- Optional: Teardown Steps
  - Format described in the `Steps` section below.

### Scenarios
- Each scenario represents a single flow in a particular specification.
- Considered sequentially.

#### Scenario Structure:
- Descriptive Scenario Name
  - H4 heading.
    - Use `####` instead of underlines.
    - Two-space indentation.
- Scenario Description
  - One sentence, if possible.
  - Two-space indentation.
  - Not a bullet point.
- Empty Line
- Scenario-Level Tags
  - Format described in the `Tags` section below.
- Empty Line
- Scenario Steps
  - Each scenario must contain at least one step.
  - Format described in the `Steps` section below.


### Tags
- Tags help categorize and filter specifications.
- Indentation:
  - Specification tags are not indented.
  - Scenario tags are indented with two spaces.
- Format: A single line that starts with `Tags:` followed by the list of tags.
  - Each tag is preceded by a space.
  - Each tag is separated by a comma and a space.
  - Tags must be entirely lowercase.
  - Each tag must be a single word.

### Steps
- Each step contains a single instruction or describes a single piece of state.
- One step per bullet point.
  - More detail may be added with one level of indented bullet points.
- Steps are considered sequentially.

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
- Logout user "mike"
- Delete user "mike"

_______
- Clean up any remaining resources
```