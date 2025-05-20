## Problem
I want to start using github copilot (hello!) in my workspace. I have read that creating documentation for a workspace can help yourself better understand the whole codebase, so I need you to help me create a functional folder structure, create custom copilot-instructions to ensure that future prompts continuously help build and maintain the documentation, and create some basic documentation.

## Supporting Information
- For this prompt only, the information in this section should either be documented somewhere and referred to in future prompts or split out into a sub-prompt that can be reused in the future.
- Always check if a file/folder exists before asking to create it.
- For this prompt only, existing files `.github/copilot-instructions.md`, `.github/prompts/reusable/style.md`, `docs/definitions/README.md`, `docs/definitions/celesteModsList/celesteModsList.md`, `docs/third-party/README.md`, `docs/third-party/celeste/celeste.md`, `docs/third-party/celeste/gamebanana/gamebanana.md`, and `docs/third-party/` take precedence over the content in this prompt.
  - Do not overwrite these files with content from this prompt.
- Note: This prompt has been processed up to the end of step 4.

### Definitions
- General rules for processing definitions:
  - All definitions listed the "Definitions" section should be transcribed in their own file within `docs/definitions/` if it relates directly to this repository or within `docs/third-party/` if it does not.
    - `docs/definitions/` should use the same file extension and sub-folder rules as `docs/third-party/` (see the `Third Party Documentation` section for details).
      - CML should be nested under Celeste Mods List.
    - Definitions that relate to third-party libraries/tools/other software should be placed within a `## Definitions` section in the appropriate file within `docs/third-party/` (see the `Third Party Documentation` section for details).
	  - Mod, Modding, Celeste Mod, and Celeste Modding Community should be nested under `docs/third-party/Celeste/`.
	  - GameBanana, Everest, and Olympus should be nested under Celeste Mod.
	  - GameBanana Mirrors should be nested under GameBanana.
    - Definitions must be specific and clear. If a definition does not meet those requirements, attempt to fix it - stop processing and ask the user for clarification if necessary.
    - After putting all definitions in their files and making any required updates, stop processing and allow the user to approve all changes before instructing you to continue.

#### Mod
A user generated asset (binary, image, video, etc) that is used to extend/modify a video game that is used to create, share, and consume user-generated content.

#### Modding
Creating and/or consuming mods.

#### Celeste
Celeste is a 2018 platformer video game. It released on various PC operating systems as well as several consoles. However, creating and playing mods is only possible on the various PC operating systems.

#### Celeste Mod
A mod for Celeste. Mods are zip files containing a variety of subfiles. These files are hosted on GameBanana. These mods can add new levels to the game, modify/add/remove game mechanics, and/or cosmetically alter graphic assets, the UI, gameplay mechanics, or any other parts of the game.

#### Celeste Modding Community
The community of people that create, play, consume other content (livestreams or let's plays), or otherwise interact with Celeste mods.

#### GameBanana
The website that the Celeste modding community uses to host Celeste mods. See the related section within the `Third Party Documentation` section.

#### Celeste Mods List
The name of this project.
- Refer to the project README for more information about the purpose and motivation behind this project.
- Also refers to to the organization working on this project.
  - For design, (other than graphical assets in the Public folder): @otobot1, @merganzic, @ShouvikGhosh2048
  - For code:
    - Active/Semi-Active: @otobot1, @ShouvikGhosh2048
    - Database contents: Mostly touhoe (an active member of the Celeste Modding Community).
      - Some others:
        - See [the original website](https://celestemods.weebly.com/).
          Read the web page and follow the other links yourself if needed.

          - See [the original spreadsheet](https://docs.google.com/spreadsheets/d/1_fYM8JABpChRmwvyydB3a6C5AkiFRqYLus4NWHJbJpU/edit?gid=537820755#gid=537820755).
          
          - The original website still operates (the averages update every 12 hours), but cannot add more mods due to inefficient API calls slowing down the script and runtime limits being exceeded.
          - This website (the original/old website) is abandoned in place.
          - Once the current/new website reaches its [v0.2.0 milestone](https://github.com/celestemods-com/CelesteMods/milestone/5), the old website will have its data exported one last time and then be shut down and pointed at the new website.
    - Other: See other GitHub contributors.
- The "current" version of the website, which is created by a forked branch within this git repository, is hosted [here](https://celestemods.com/)

#### CML
Short for "Celeste Mods List".

#### Everest
The modding API used by Celeste mods. Automatically updates mods after the game launches.

#### Olympus
The mod manager officially recommended for managing Everest installs and updates and for managing mod installs and updates.

#### GameBanana Mirrors
"A" GameBanana Mirror is any data repository that monitors and duplicates the contents of "the" GameBanana Mirror or of GameBanana itself.

- "The" GameBanana Mirror
  - Its URL is somewhere in this git repository.
  - Hosted by Jade/0x0ade.
  - The original GameBanana mirror.
  - Contents are managed by Maddie (who hosts [a lot of Celeste modding infrastructure and other stuff](https://maddie480.ovh/))
    - Managed by [this service](https://github.com/maddie480/EverestUpdateCheckerServer) that Maddie hosts.
    - Various indices provided.
      - These are the most important for this project.
      - Indices update automatically on timescales of less than 1 hour but more than 5 minutes.
      - https://maddie480.ovh/celeste/everest_update.yaml
      - https://maddie480.ovh/celeste/mod_search_database.yaml
- WEGFan Mirror:
  - Hosted by WEGFan.
  - https://celeste.weg.fan/
  - Works better (at all?) in mainland China.
- The CML GameBanana Mirror
  - A GameBanana mirror hosted by @otobot1 as part of the CML project.
  - Hosted through the CloudFlare CDN on CloudFlare's R2 storage.
    - It's cheap.
    - It's fast.
    - It has no per-byte data egress fees.
  - The code used to host it is present in this git repository and another hosted in the same GitHub organization as this repository.
  - It mostly piggy-backs off of Maddie's Everest Update Checker service.

### Third Party Documentation
- General rules for processing third party documentation:
  - All direct child sub-sections listed the "Third Party Documentation" section should be transcribed within a `## Documentation` section at the top of their own file within `docs/third-party/`.
    - The file extension should be `.md`.
    - Sub-folders may be used if appropriate.
	  - If sub-folder(s) is(are) needed for a library, then that library's file should be moved inside of its own folder along with the sub-folder(s).
	  - Example: 
		- Library A is not used by any other library - its info should be in a file or subfolder within `docs/third-party/`.
	    - Library B is only used by Library A - its info should be in a file or subfolder within Library A's folder.
		- Library C is only used by Library A - its info should be in a file or subfolder within Library A's folder.
		- Library D is only used by Library B - its info should be in a file or subfolder within Library B's folder.
		- Library E is not used by any other library - its info should be in a file or subfolder within `docs/third-party/`.
	    - These files and folders would be created for libraries A, B, C, D, and E (this is only an example - don't actually create these files!):
		  - `docs/third-party/Library A/`
		  - `docs/third-party/Library A/Library A.md`
		  - `docs/third-party/Library A/Library B/`
		  - `docs/third-party/Libary A/Library B/Library B.md`
		  - `docs/third-party/Library A/Library C.md`
		  - `docs/third-party/Library A/Library B/Library D.md`
		  - `docs/third-party/Library E.md`
  - After putting all third party documentation in their files and making any required updates, stop processing and allow the user to approve all changes before instructing you to continue.
- Nextjs and Mantinejs should be nested under Reactjs.
- npm and NVM should be nested under node.
- Mantine Datatable and Emotionjs should be nested under Mantinejs
- tRPC should be nested under Nextjs.
- All others should be directly under `docs/third-party/`.

#### Custom Github Copilot Instructions/Github Copilot Prompts
Review [this documentation](https://code.visualstudio.com/docs/copilot/copilot-customization). For today, we are only using the `.github/copilot-instructions.md` file to set custom instructions and the `.github/prompts/create-copilot-instructions.prompt.md` reusable prompt file for creating and iterating on this prompt.

#### node
This is a node.js project. The package.json defines our current version of node. If you need to refer to the node.js api documentation, the documentation for version 20.4.0 can be found [here](https://nodejs.org/docs/v20.4.0/api/).

#### npm
Stands for "Node Package Manager". We use it to download our dependencies and run the scripts defined in our `package.json` file.

#### NVM
Stands for "Node Version Manager". Used to manage which versions of node and npm are installed. There are Windows and POSIX versions - if NVM comes up, ensure you are using the correct project's documentation (as determined by the operating system currently being used).
POSIX version: https://github.com/nvm-sh/nvm
Windows version: https://github.com/coreybutler/nvm-windows

#### Nextjs
This repository is for a self-hosted Nextjs website. Refer to the package.json for our current version of Nextjs.
- Documentation for version 14 of Nextjs: https://nextjs.org/docs/14/getting-started.
  - `Pages Router`:
    - The `src/pages/` folder is a "magic" folder. Its structure defines the route structure of the web pages generated by the `Pages Router`.
    - Documentation for the `Pages Router`: https://nextjs.org/docs/14/pages/building-your-application/routing
    - Documentation for `API Routes`: https://nextjs.org/docs/14/pages/building-your-application/routing/api-routes
  - `App Router`:
    - The `src/app/` folder is also a "magic" folder. Its structure defines the route structure of the web pages generated by the `App Router`. Routes may not be defined by both the Pages and App Routers.
    - Documentation for the `App Router`: https://nextjs.org/docs/14/app/building-your-application/routing
    - Documentation for `Route Handlers`: https://nextjs.org/docs/14/app/building-your-application/routing/route-handlers

#### Reactjs
Our UI is built with React. Refer to the package.json for our current version of React. The documentation for version 18 of React can be found [here](https://18.react.dev/reference/react).

#### Mantinejs
We use Mantine to provide some pre-built React components. Refer to the package.json for our current Mantine version. The version numbers of @Mantine packages should always be in sync. The documentation for version 6 of Mantine can be found [here](https://v6.mantine.dev/pages/getting-started/). Mantine has a lot of depth, but we aren't currently using much of it.

#### Emotionjs
A css-in-js library used by Mantine to style React components. We currently use it to apply our styles whenever possible. Some styles are applied via the `src/styles/globals.css` file instead, as they didn't work when applied with Emotionjs.
General Emotionjs documentation: https://emotion.sh/docs/introduction
Mantine v6 documentation on the Emotionjs cache: https://v6.mantine.dev/theming/emotion-cache/
Emotionjs documentation on the Emotionjs cache: https://emotion.sh/docs/@emotion/cache

#### Mantine Datatable
A library providing a React datatable component. This library is the main reason we use Mantine at all. The major version of this library must match the major version of the @Mantine libraries. Refer to the package.json for our current Mantine Datatable version. The documentation for v6 of Mantine Datatable can be found [here](https://icflorescu.github.io/mantine-datatable-v6/).

#### tRPC
We use tRPC to keep our backend API definitions and our frontend API calls in sync and typesafe. Refer to the package.json for our current version of tRPC. The docs for v10 of tRPC can be found [here](https://trpc.io/docs/v10/). tRPC only really makes sense in the Nextjs `Pages Router`.

#### Prisma ORM
Prisma ORM (Prisma for short) is an Object-Relational-Mapping (ORM) library. We use it to interact with our MariaDB database, both in the Nextjs application and for data migrations. Our Prisma schema file is the primary source of truth for our database schema. The Prisma client is programatically generated from our Prisma schema and consists of a binary that actually talks to the database and corresponding type definitions. Don't write SQL - use the Prisma client's API instead. We don't use Prisma Studio.
- Refer to the package.json for our current version of Prisma.
- Generated Prisma client types: `node_modules\.prisma\client\index.d.ts`
- Prisma ORM docs: https://www.prisma.io/docs/orm.
  - Reference docs for the Prisma Schema file (a subset of the Prisma ORM docs): https://www.prisma.io/docs/orm/reference/prisma-schema-reference

#### Pino
The library we use for server-side logging.
- Try and find a documentation link (and then ask for approval before using it) if one is ever needed to satisfy a prompt.

#### GameBanana
The website used to host celeste mod files and various other modding community assets.
  - Mostly the mods themselves (zip files), images, and text (comments, titles, descriptions, etc).
  - GameBanana hosts assets for the modding communities of many video games.
    - The portion of the site dedicated to Celeste can be found here: https://gamebanana.com/games/6460
  - We pull some data from them through one of their APIs.
    - They offer access to the same database through multiple APIs accessible through various URL and/or subdomain schemes.
    - We use [this API](https://api.gamebanana.com/) to fetch various data and avoid hosting it as part of the website.
    - There is a PR currently open working on preferentially using the data stored in the CML GameBanana Mirror, with fallback to GameBanana itself only if required. Ignore this PR unless it is obviously relevant to the current prompt.

### File Structure
- All files and folders listed in this section should be described by specifications as part of this prompt unless otherwise specified by a more specific instruction.
  - The descriptions included in the prompt, if present, may be expanded or otherwise adjusted, if needed.
  - If no description was included in the prompt, attempt to write one.
  - After writing all specifications, stop processing and allow the user to approve all changes before instructing you to continue.

Recommended File Structure:

#### `.github/copilot-instructions.md`
The Custom Github Copilot Instructions file referred to in the provided documentation. If general instructions are given in this or future prompts, they should be added to this file or to a file referenced from this file.

#### `.github/prompts/`
Where reusable prompt files are stored (refer to the supplied Github Copilot Prompts documentation). Create meaningful sub-directories to keep prompts organized and reorganize if required. If creating a new prompt, create a new file in this directory or one of its sub-directories. If iterating on a prompt (new or existing) keep its prompt file up to date throughout the process.

#### `.github/prompts/create-copilot-instructions.prompt.md`
Where this prompt is. If iterating on this prompt, update this file.

#### `.next/`
This directory contains Nextjs's outputs. It should generally be ignored, but sometimes it may need to be considered if troubleshooting a bug that may be caused by Nextjs itself.

#### `.vscode/`
Contains recommended VSCode extensions and recommended settings for this workspace. Can be updated if needed, but updating it is likely not needed for this prompt.

#### `docs/`
The general location for documentation about this git repository. Most, if not all, files will be markdown. Generally information should not be documented in two places, so information contained in a config file like `next.config.mjs` or `tsconfig.json` will typically not be covered again in `docs/`. The centralized documentation should provide minimal context and point to the relevant configuration files.

Every sub-directory of `docs/` should have a README file:
- List any direct children (sub-directories or files)
  - Give brief descriptions of each.
  - Use a table.
- If useful, describe the purpose of the directory. For example:
  - `docs/specifications/` should (and does) have a README file.
  - Most, if not all, sub-directories of `docs/specifications/` will not have README files, as their purpose is inherited from `docs/specifications/`.

#### `docs/README.md`
Explains the various files and folders within `docs/`.

#### `docs/style/README.md`

#### `docs/style/docs/first-party.md`
Contains all first party documentation style instructions in natural language - mostly in bullet points. `copilot-instructions.md` should point here. If this file becomes too complex, refactor it into a subdirectory.

#### `docs/style/code.md`
Contains all code style instructions in natural language - mostly in bullet points. `copilot-instructions.md` should point here. If this file becomes too complex, refactor it into a subdirectory.

#### `docs/specifications/`
Contains all spec files.

#### `docs/specifications/README.md`
Explains the purpose of the specifications folder and defines both the spec file syntax and the folder/file structure within the specifications folder.

#### `docs/definitions/`

#### `docs/definitions/README.md`
Describes the syntax of first party definition records and refers back to `docs/style/docs/first-party.md` when appropriate instead of duplicating information. 

#### `docs/third-party/`
Contains references to third party documentation that may be useful in the future. Contents are described further in the `Third Party Docs` section of this prompt.

#### `docs/third-party/README.md`
Describes the syntax of third party documentation records.

#### `logs/`
Contains log files.

#### `node_modules/`
Contains downloaded npm packages.

#### `prisma/`
Contains the Prisma configuration.

#### `prisma/schema.prisma`
Prisma schema.

#### `prisma/seed.ts`
Prisma seed script.

#### `prisma/migrations/`
Prisma migrations folder.

#### `public/`
Nextjs public resources folder.

#### `src/`
Nextjs application root.

#### `src/emotionCache.ts`
Refer to Emotionjs documentation.

#### `src/env.mjs`
Created by `t3 App`. Not currently functional/maintained. Should run once on Nextjs server launch and verify every environment variable to ensure they all loaded as expected. Do not fix as part of this prompt.

#### `src/app/`
Nextjs `app directory`. The folder structure defines the HTTP route structure. Currently only used to host the CML GameBanana Mirror.

#### `src/app/api/`
Defines Nextjs Route Handlers.

#### `src/components/`
Contains all React components, other than route-specific components (such as Nextjs page components).

#### `src/consts/`
Contains constant values that don't belong anywhere more specific.

#### `src/hooks/`
Contains React hooks.

#### `src/logger/`
Contains the config for loggers (currently just Pino).

#### `src/pages/`
Nextjs `Pages Router`. The folder structure defines the HTTP route structure. Routes may not be defined in both the `App Router` and the `Pages Router`.

#### `src/pages/api/`
Defines Nextjs `API Routes`. The folder structure defines the HTTP route structure. Routes may not be defined in both `Route Handlers` and `API Routes`. Contains minimal logic - the bulk of the API logic is defined in `src/server/` and called from here.

#### `src/server/`
Contains the bulk of the server-side logic.

#### `src/styles/`
Contains the `globals.css` file, which is automatically consumed (by either Nextjs or Emotionjs, I'm not sure) and applied to every web page. Also contains any web page styling related constants.

#### `src/utils/`
Contains helper functions that don't belong in a more specific folder.

#### `.env`
Contains secrets. No AI/LLM should ever read this file.

#### `.env.example`
Example `.env` file with all of the environment variables used, but without secrets.

#### `.eslintrc.cjs`
ESLint config file. We don't currently use ESLint.

#### `.gitignore`
Specifies the files/folders to be excluded by git. The files/folders excluded by git should also be excluded from your context, unless otherwise specified.

#### `CONTRIBUTING.md`

#### `LICENSE.md`

#### `next-env.d.ts`

#### `next.config.mjs`

#### `package-lock.json`

#### `package.json`

#### `README.md`

#### `SECURITY.md`

#### `tsconfig.json`
TypeScript config file.

### Specifications
- All specifications are defined in spec files within the specifications directory.
  - Specifications Directory: `docs/specifications/`
  - Spec file file extension: `.spec.md`
  - A specification can also be used to describe the function of any file or folder in this repository.
- All files and folders should be covered by a specification, regardless of if there is a related README.
  - A related README should reference the relevant specification(s) instead of duplicating information.
- The specifications directory largely mirrors the structure of the rest of the repository.

#### Spec Files
- Start with a single spec file for the root directory and split it only when required.

- When to split a spec file:
  - If there is exactly one subdirectory with no subdirectories of its own, all of its files may be included in `Files`.
    - Either all files are included, or no files are included.
    - Generally, no files should be included.
      - Only include the files for simple subdirectories.
      - A balance should be kept between reducing the complexity of a given spec file and the added developer burden/cognitive load of having more spec files.
    - Either way, the directory should be listed in `Directories`.
      - The directory's bullet point's first child should be a bullet point giving its description.
      - If the directories files are included, the subsequent bullet points should list the names of the files in the form `[directory name]/[file name]`.
  - If there is more than one subdirectory, none of their files may be included in `Files`.
  - If there is exactly one subdirectory, but it contains at least one subdirectory of its own, none of its files may be included in `Files`.

- Spec File Names
  - End in `.spec.md`.
  - Each directory should have a spec file named `specifications.spec.md`.
    - This spec file must contain names and descriptions for every file and subdirectory.
    - By default, this spec file will contain a `File` entry within the `Files` section for each file.
    - If the spec file grows too complicated, split any subdirectory files into their own spec file within the appropriate subdirectory.
    - If the spec file still grows too complicated, remove the `Files` section and give each file its own spec file.
      - The spec file names should be of the form `[file name].spec.md`.
      - If possible, ignore the file extension of the original file(s).
      - If required for clarity, include the file extension of the original file in `[file name]`.

Spec files will have the following sections:
##### `Directories`
- H1 (# not underlines).
- Contains the names and descriptions of all direct-child subdirectories.
  - Names should be H2 with no indentation.
  - The descriptions should be the first bullet point nested under each name.
- Should be omitted if there are no subdirectories.

##### `Files`
- H1 (# not underlines).
- Contains a `File` entry for each file in the directory (and, optionally, in a single subdirectory).
  - Starts with a file name.
    - H2 (## not underlines).
    - No indentation.
  - The first bullet point under the file name should be the file description.
  - Any specifications should come after the file description.

#### Specifications Directory Structure
- The specifications directory has a hierarchical file structure.
  - `docs/specifications/` is equivalent to the project root.
  - The subdirectories of `docs/specifications/` should mirror the various subdirectories of the project root, with the following exception:
    - Neither the `docs/` folder nor any of its contents (including subdirectories) should have specifications.
      - Their purposes should be explained in README files.
- Coverage:
  - Directory/File Coverage:
    - All files and folders not excluded by `.gitignore` should be covered in a spec file (unless otherwise specified in this prompt).
      - A file being "covered" by a specificaton means that the file's purpose is explained in a spec file.
      - Additionally, each of that file's functions/features should be covered by a specification.
  - Specification Coverage:
    - Each feature of the Nextjs server should be described in a specification.
    - If a file or directory outside of the `src/` directory is included in the `Directory/File Coverage` section, their features should be described in specifications.
      - Avoid information duplication.
        - If there is a README, include its information in the specificiation and refer to it from the README.
        - If there is a config file, summarize what it's for and any general guiding principles/other notes related to how it was configured in the specification, and then reference the specification in comments in the config file, if possible.

#### Specification
- Each function/feature of the Nextjs application should typically be covered by one specification.
- Considered sequentially.

Specification Structure:
- Descriptive Specification Name
  - H3 (### not underlines).
  - No indentation.
- Empty Line
- Specification Description
  - One sentence, if possible.
  - No indentation.
  - Not a bullet point.
- Empty Line
- Specification-Level Tags
  - See the `Tags` subsection of the `Specifications` section of this prompt.
- Empty Line
- Optional: Context Steps
  - See the `Steps` subsection of the `Specifications` section of this prompt.
- Empty Line(s) 
  - One empty line if there are no context steps.
  - Two empty lines if there are context steps.
- Scenarios
  - See the `Scenario` subsection of the `Specifications` section of this prompt.
  - Must be at least one scenario per specification.
  - Must be one empty line between the last step of a scenario and the title of the next scenario.
- Optional: Tear Down Steps
  - See the `Steps` subsection of the `Specifications` section of this prompt.

#### Scenario
- Each scenario represents a single flow in a particular specification.
- Considered sequentially.

Scenario Structure:
- Descriptive Scenario Name
  - H4 with two-space indentation
- Scenario Description
  - One sentence, if possible.
  - Two-space indentation.
  - Not a bullet point.
- Empty Line
- Scenario-Level Tags
  - See the `Tags` subsection of the `Specifications` section of this prompt.
- Scenario Steps
  - Must be at least one step per scenario.
  - See the `Steps` subsection of the `Specifications` section of this prompt.

#### Tags
- Indentation:
  - Specification tags are not indented.
  - Scenario tags are two-space indented.

Tags Structure:
- A single line.
  - Starts with "Tags:".
  - The "Tags:" label is followed by the list of tags.
    - Each tag is preceded by a space.
    - Tags are separated by a comma (and a the space preceeding the second tag).
    - Tags must be all lowercase.
    - Each tag must be a single word.

#### Steps
- Each step contains a single instruction or describes a single piece of state.
- One step per bullet point.
  - More detail may be added with one level of indented bullet points.
- Considered sequentially.

##### Context Steps
- Steps declared between a specification description and the first scenario name are context steps.
- Optional section.
- Specify any states or sets of conditions that are necessary for executing the specification's scenarios.
- Considered before each of the specification's scenarios.

Examples:
- User is logged in as "mike"
  - If required, sign up for user "mike"
  - If required, log in as "mike"
- Navigate to the project page

##### Scenario Steps
- Steps declared with a scenario are scenario steps.

Examples:
- Delete the "example" project
- Ensure the "example" project has been deleted

##### Teardown Steps
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
- Logout user "mike"
- Delete user "mike"

### Style
- For now, put all styling instructions in a `.github\prompts\reusable\style.md` and refer to it from the custom instructions file.

#### First Party Docs

#### Third Party Docs

#### Markdown Files
- File extension: `.md`
- Always use proper title/sentence capitalization (use this prompt as an example to derive more specific rules from).
- Always use proper punctuation at the end of sentences.
- No empty line between a heading and a bullet point.
- Use `-` for bullet points, not `*`.

#### Prompt Files
- Prompt files count as "prose", not "code".
- File extension: `.prompt.md`
- Prompt files are a subset of markdown files.

#### README Files
- File name is always: `README.md`
- README files are a subset of markdown files.

#### UI Style

#### Code Style

##### Type Declarations

##### React Components Code
- Always use functional components.

##### Other Code Style
- Prefer double quotes over single quotes.
- Prefer tabs over spaces for whitespace in code.
- Tab width = 2 spaces.

#### Other Style
- Always use Oxford commas in prose (comments/documentation/etc) (not in code).

## Steps To Complete
- Here are some general rules that apply to this prompt and should apply to all future prompts:
  - Any general rules (including these ones!) should be recorded either in the custom instructions file or in a reusable prompt file that is referred to in the custom instructions file so that they are part of the context of every prompt.
  - Standard Reused Prompts:
    - Standard reused prompts are prompts referred to by the custom instructions file or by another standard reused prompt.
  - When responding to a prompt, use the following numbered steps to process the main prompt and any other prompts that aren't standard reused prompts:
    - Standard reused prompts should have these steps performed when they are created, or, if created without using copilot, as the first step when they are first used.
	  - Once a prompt is reviewed, add to the beginning of the file "Reviewed by Copilot" on its own line followed by a blank line.
	    - This is how we will track whether a prompt has been reviewed.
		- If a persona creates a prompt manually, they will leave this line out.
    1. Review the prompt for any spelling mistakes. If any are found, stop and clarify with the user before fixing any of them - they may not actually be mistakes.
	2. Review the prompt for any instructions/information that appears contradictory.
	  - If found, ask the user for clarification and stop processing.
	  - If none found, continue.
	3. Review the prompt for any general rules (that apply beyond that specific prompt).
	  - If any are found, add them to either the custom instructions file or a reusable prompt file that is referred to in the custom instructions file, and stop processing and allow the user to approve all changes before instructing you to continue.
	  - If none are found, carry on.
	4. Review the prompt for definitions and process them according to the general rules for definitions.
	  - If any file changes were made, stop processing and allow the user to approve all changes before instructing you to continue.
	5. Review the prompt for third-party documentation and process it according the the general rules for third-party documentation.
	  - If any file changes were made, stop processing and allow the user to approve all changes before instructing you to continue.
	6. Evaluate the prompt to determine what specifications should exist before proceeding.
	  - Review existing specifications.
	  - Create/update specifications as required.
        - Specifications have only been added to the repository recently, so not all of the codebase is covered yet.
        - As a general rule, don't overcomplicate your changes by attempting to fix all specifications - only create or update the specifications that are relevant to the task at hand.
	  - If any file changes were made, stop processing and allow the user to approve all changes before instructing you to continue.
	7. Proceed with the rest of the prompt.
	  - Always check if there is a `Steps To Complete` section - follow these instructions if present.