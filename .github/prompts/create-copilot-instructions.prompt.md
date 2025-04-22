## Problem
I want to start using github copilot (hello!) in my workspace. I have read that creating documentation for a workspace can help yourself better understand the whole codebase, so I need you to help me create a functional folder structure, create custom copilot-instructions to ensure that future prompts continuously help build and maintain the documentation, and create some basic documentation.

## Supporting Information
* The information in this section should either be documented somewhere and referred to in future prompts or split out into a sub-prompt that can be reused in the future.

### Definitions

#### Mod
A user generated asset (binary, image, video, etc) that is used to extend/modify a video game that is used to create, share, and consumpe user-generated content.

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
* Refer to the project README for more information about the purpose and motivation behind this project.
* Also refers to to the organization working on this project.
  * For design, (other than graphical assets in the Public folder): @otobot1, @merganzic, @ShouvikGhosh2048
  * For code:
    * Active/Semi-Active: @otobot1, @ShouvikGhosh2048
    * Database contents: Mostly touhoe (an active member of the Celeste Modding Community).
      * Some others:
        * See [the original website](https://celestemods.weebly.com/).
          Read the web page and follow the other links yourself if needed.

          * See [the original spreadsheet](https://docs.google.com/spreadsheets/d/1_fYM8JABpChRmwvyydB3a6C5AkiFRqYLus4NWHJbJpU/edit?gid=537820755#gid=537820755).
          
          * The original website still operates (the averages update every 12 hours), but cannot add more mods due to inefficient API calls slowing down the script and runtime limits being exceeded.
          * This website (the original/old website) is abandoned in place.
          * Once the current/new website reaches its [v0.2.0 milestone](https://github.com/celestemods-com/CelesteMods/milestone/5), the old website will have its data exported one last time and then be shut down and pointed at the new website.
    * Other: See other GitHub contributors.
* The "current" version of the website, which is created by a forked branch within this git repository, is hosted [here](https://celestemods.com/)

#### CML
Short for "Celeste Mods List".

#### Everest
The modding API used by Celeste mods. Automatically updates mods after the game launches.

#### Olympus
The mod manager officially recommended for managing Everest installs and updates and for managing mod installs and updates.

#### GameBanana Mirrors
"A" GameBanana Mirror is any data repository that monitors and duplicates the contents of "the" GameBanana Mirror or of GameBanana itself.

* "The" GameBanana Mirror
  * Its URL is somewhere in this git repository.
  * Hosted by Jade/0x0ade.
  * The original GameBanana mirror.
  * Contents are managed by Maddie (who hosts [a lot of Celeste modding infrastructure and other stuff](https://maddie480.ovh/))
    * Managed by [this service](https://github.com/maddie480/EverestUpdateCheckerServer) that Maddie hosts.
    * Various indices provided.
      * These are the most important for this project.
      * Indices update automatically on timescales of less than 1 hour but more than 5 minutes.
      * https://maddie480.ovh/celeste/everest_update.yaml
      * https://maddie480.ovh/celeste/mod_search_database.yaml
* WEGFan Mirror:
  * Hosted by WEGFan.
  * https://celeste.weg.fan/
  * Works better (at all?) in mainland China.
* The CML GameBanana Mirror
  * A GameBanana mirror hosted by @otobot1 as part of the CML project.
  * Hosted through the CloudFlare CDN on CloudFlare's R2 storage.
    * It's cheap.
    * It's fast.
    * It has no per-byte data egress fees.
  * The code used to host it is present in this git repository and another hosted in the same GitHub organization as this repository.
  * It mostly piggy-backs off of Maddie's Everest Update Checker service.

### Third Party Documentation

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

#### Next.js
This repsitory is for a self-hosted Next.js website. Refer to the package.json for our current version of Next.js. 
* Documentation for version 14 of Next.js: https://nextjs.org/docs/14/getting-started.
  * `Pages Router`:
    * The `src/pages/` folder is a "magic" folder. Its structure defines the route structure of the web pages generated by the `Pages Router`.
    * Documentation for the `Pages Router`: https://nextjs.org/docs/14/pages/building-your-application/routing
    * Documentation for `API Routes`: https://nextjs.org/docs/14/pages/building-your-application/routing/api-routes
  * `App Router`:
    * The `src/app/` folder is also a "magic" folder. Its structure defines the route structure of the web pages generated by the `App Router`. Routes may not be defined by both the Pages and App Routers.
    * Documentation for the `App Router`: https://nextjs.org/docs/14/app/building-your-application/routing
    * Documentation for `Route Handlers`: https://nextjs.org/docs/14/app/building-your-application/routing/route-handlers

#### React.js
Our UI is built with React. Refer to the package.json for our current version of React. The documentation for version 18 of React can be found [here](https://18.react.dev/reference/react).

#### Mantine.js
We use Mantine to provide some pre-built React components. Refer to the package.json for our current Mantine version. The version numbers of @Mantine packages should always be in sync. The documentation for version 6 of Mantine can be found [here](https://v6.mantine.dev/pages/getting-started/). Mantine has a lot of depth, but we aren't currently using much of it.

#### Emotion.js
A css-in-js library used by Mantine to style React components. We currently use it to apply our styles whenever possible. Some styles are applied via the `src/styles/globals.css` file instead, as they didn't work when applied with Emotion.js.
General Emotion.js documentation: https://emotion.sh/docs/introduction
Mantine v6 documentation on the Emotion.js cache: https://v6.mantine.dev/theming/emotion-cache/
Emotion.js documentation on the Emotion.js cache: https://emotion.sh/docs/@emotion/cache

#### Mantine Datatable
A library providing a React datatable component. This library is the main reason we use Mantine at all. The major version of this library must match the major version of the @Mantine libraries. Refer to the package.json for our current Mantine Datatable version. The documentation for v6 of Mantine Datatable can be found [here](https://icflorescu.github.io/mantine-datatable-v6/).

#### tRPC
We use tRPC to keep our backend API definitions and our frontend API calls in sync and typesafe. Refer to the package.json for our current version of tRPC. The docs for v10 of tRPC can be found [here](https://trpc.io/docs/v10/). tRPC only really makes sense in the Next.js `Pages Router`.

#### Prisma ORM
Prisma ORM (Prisma for short) is an Object-Relational-Mapping (ORM) library. We use it to interact with our MariaDB database, both in the Next.js application and for data migrations. Our Prisma schema file is the primary source of truth for our database schema. The Prisma client is programatically generated from our Prisma schema and consists of a binary that actually talks to the database and corresponding type definitions. Don't write SQL - use the Prisma client's API instead. We don't use Prisma Studio.
* Refer to the package.json for our current version of Prisma.
* Generated Prisma client types: `node_modules\.prisma\client\index.d.ts`
* Prisma ORM docs: https://www.prisma.io/docs/orm.
  * Reference docs for the Prisma Schema file (a subset of the Prisma ORM docs): https://www.prisma.io/docs/orm/reference/prisma-schema-reference

#### Pino
The library we use for server-side logging.
* Try and find a documentation link (and then ask for approval before using it) if one is ever needed to satisfy a prompt.

#### GameBanana
The website used to host celeste mod files and various other modding community assets.
  * Mostly the mods themselves (zip files), images, and text (comments, titles, descriptions, etc).
  * GameBanana hosts assets for the modding communities of many video games.
    * The portion of the site dedicated to Celeste can be found here: https://gamebanana.com/games/6460
  * We pull some data from them through one of their APIs.
    * They offer access to the same database through multiple APIs accessible through various URL and/or subdomain schemes.
    * We use [this API](https://api.gamebanana.com/) to fetch various data and avoid hosting it as part of the website.
    * There is a PR currently open working on preferentially using the data stored in the CML GameBanana Mirror, with fallback to GameBanana itself only if required. Ignore this PR unless it is obviously relevant to the current prompt.

### File Structure
* Good suggestions are welcome!
* All files and folders listed in this section should be described by specifications as part of this prompt unless otherwise specified by a more specific instruction.
  * The descriptions included in the prompt, if present, may be expanded or otherwise adjusted, if needed.
  * If no description was included in the prompt, attempt to write one.
  * Ask for clarification if required.

Recommended File Structure:

#### `.github/copilot-instructions.md`
The Custom Github Copilot Instructions file referred to in the provided documentation. If general instructions are given in this or future prompts, they should be added to this file or to a file referenced from this file.

#### `.github/prompts/`
Where reusable prompt files are stored (refer to the supplied Github Copilot Prompts documentation). Create meaningful sub-directories to keep prompts organized and reorganize if required. If creating a new prompt, create a new file in this directory or one of its sub-directories. If iterating on a prompt (new or existing) keep its prompt file up to date throughout the process.

#### `.github/prompts/create-copilot-instructions.prompt.md`
Where this prompt is. If iterating on this prompt, update this file.

#### `.next/`
This directory contains Next.js's outputs. It should generally be ignored, but sometimes it may need to be considered if troubleshooting a bug that may be caused by Next.js itself.

#### `.vscode/`
Contains recommended VSCode extensions and recommended settings for this workspace. Can be updated if needed, but updating it is likely not needed for this prompt.

#### `docs/`
The general location for documentation about this git repository. Most, if not all, files will be markdown. Generally information should not be documented in two places, so information contained in a config file like `next.config.mjs` or `tsconfig.json` will typically not be covered again in `docs/`. The centralized documentation should provide minimal context and point to the relevant configuration files.

Every sub-directory of `docs/` should have a README file:
* List any direct children (sub-directories or files)
  * Give brief descriptions of each.
  * Use a table.
* If useful, describe the purpose of the directory. For example:
  * `docs/specifications/` should (and does) have a README file.
  * Most, if not all, sub-directories of `docs/specifications/` will not have README files, as their purpose is inherited from `docs/specifications/`.

#### `docs/README.md`
Explains the various files and folders within `docs/`.

#### `docs/style/README.md`

#### `docs/style/docs/third-party/`
Contains any third party documentation records.

#### `docs/style/docs/third-party/README.md`
Describes the syntax of third party documentation records.

#### `docs/style/docs/first-party.md`
Contains all first party documentation style instructions in natural language - mostly in bullet points. `copilot-instructions.md` should point here. If this file becomes too complex, refactor it into a subdirectory.

#### `docs/style/code.md`
Contains all code style instructions in natural language - mostly in bullet points. `copilot-instructions.md` should point here. If this file becomes too complex, refactor it into a subdirectory.

#### `docs/specifications/`
Contains all spec files.

#### `docs/specifications/README.md`
Explains the purpose of the specifications folder and defines both the spec file syntax and the folder/file structure within the specifications folder.

#### `docs/third-party/`
Contains references to third party documentation that may be useful in the future. Contents are described further in the `Third Party Docs` section of this prompt.

#### `docs/third-party/README.md`
This is not a description, but this file should exist.

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
Next.js public resources folder.

#### `src/`
Next.js application root.

#### `src/emotionCache.ts`
Refer to Emotion.js documentation.

#### `src/env.mjs`
Created by `t3 App`. Not currently functional/maintained. Should run once on Next.js server launch and verify every environment variable to ensure they all loaded as expected. Do not fix as part of this prompt.

#### `src/app/`
Next.js `app directory`. The folder structure defines the HTTP route structure. Currently only used to host the CML GameBanana Mirror.

#### `src/app/api/`
Defines Next.js Route Handlers.

#### `src/components/`
Contains all React components, other than route-specific components (such as Next.js page components).

#### `src/consts/`
Contains constant values that don't belong anywhere more specific.

#### `src/hooks/`
Contains React hooks.

#### `src/logger/`
Contains the config for loggers (currently just Pino).

#### `src/pages/`
Next.js `Pages Router`. The folder structure defines the HTTP route structure. Routes may not be defined in both the `App Router` and the `Pages Router`.

#### `src/pages/api/`
Defines Next.js `API Routes`. The folder structure defines the HTTP route structure. Routes may not be defined in both `Route Handlers` and `API Routes`. Contains minimal logic - the bulk of the API logic is defined in `src/server/` and called from here.

#### `src/server/`
Contains the bulk of the server-side logic.

#### `src/styles/`
Contains the `globals.css` file, which is automatically consumed (by either Next.js or Emotion.js, I'm not sure) and applied to every web page. Also contains any web page styling related constants.

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
* All specifications are defined in spec files within the specifications directory.
  * `docs/specifications/`
  - A specification can also be used to describe the function of any file or folder in this repository.
* Ideally, all files and folders should be covered by a specification, regardless of if there is a related README.
  * A related README should reference the relevant specification(s) instead of duplicating information.
* The specifications directory largely mirrors the structure of the rest of the repository

#### Spec Files
* Start with a single spec file for the root directory and split it only when required.

* When to split a spec file:
  * If there is exactly one subdirectory with no subdirectories of its own, all of its files may be included in `Files`.
    * Either all files are included, or no files are included.
    * Generally, no files should be included.
      * Only include the files for simple subdirectories.
      * A balance should be kept between reducing the complexity of a given spec file and the added developer burden/cognitive load of having more spec files.
    * Either way, the directory should be listed in `Directories`.
      * The directory's bullet point's first child should be a bullet point giving its description.
      * If the directories files are included, the subsequent bullet points should list the names of the files in the form `[directory name]/[file name]`.
  * If there is more than one subdirectory, none of their files may be included in `Files`.
  * If there is exactly one subdirectory, but it contains at least one subdirectory of its own, none of its files may be included in `Files`.

* Spec File Names
  * End in `.spec.md`.
  * Each directory should have a spec file named `specifications.spec.md`.
    * This spec file must contain names and descriptions for every file and subdirectory.
    * By default, this spec file will contain a `File` entry within the `Files` section for each file.
    * If the spec file grows too complicated, split any subdirectory files into their own spec file within the appropriate subdirectory.
    * If the spec file still grows too complicated, remove the `Files` section and give each file its own spec file.
      * The spec file names should be of the form `[file name].spec.md`.
      * If possible, ignore the file extension of the original file(s).
      * If required for clarity, include the file extension of the original file in `[file name]`.

Spec files will have the following sections:
##### `Directories`
* H1 (# not underlines).
* Contains the names and descriptions of all direct-child subdirectories.
  * Names should be H2 with no indentation.
  * The descriptions should be the first bullet point nested under each name.
* Should be omitted if there are no subdirectories.

##### `Files`
* H1 (# not underlines).
* Contains a `File` entry for each file in the directory (and, optionally, in a single subdirectory).
  * Starts with a file name.
    * H2 (## not underlines).
    * No indentation.
  * The first bullet point under the file name should be the file description.
  * Any specifications should come after the file description.

#### Specifications Directory Structure
* The specifications directory has a hierarchical file structure.
  * `docs/specifications/` is equivalent to the project root.
  * The subdirectories of `docs/specifications/` should mostly mirror the various subdirectories of the project root.
    * Neither the `docs/` folder nor any of its contents (including subdirectories) should have specifications.
      * Their purposes should be explained in README files.
* Coverage:
  * Directory/File Coverage:
    * All files and folders not excluded by `.gitignore` should be covered in a spec file (unless otherwise specified).
      * A file being "covered" by a specificaton means that the file's purpose is explained in a spec file.
      * Additionally, each of that file's functions/features should be covered by a specification.
  * Specification Coverage:
    * Each feature of the Next.js server should be described in a specification.
    * If a file or directory outside of the `src/` directory is included in the `Directory/File Coverage` section, their features should be described in specifications.
      * Avoid information duplication.
        * If there is a README, summarize it in one sentence and refer to that file for details.
        * If there is a config file, summarize what it's for and any general guiding principles/other notes related to how it was configured, and then refer to that file.

#### Specification
* Each function/feature of the Next.js application should typically be covered by one specification.
* Considered sequentially.

Specification Structure:
* Descriptive Specification Name
  * H3 (### not underlines).
  * No indentation.
* Empty Line
* Specification Description
  * One sentence, if possible.
  * No indentation.
  * Not a bullet point.
* Empty Line
* Specification-Level Tags
  * See the `Tags` subsection of the `Specifications` section of this prompt.
* Empty Line
* Optional: Context Steps
  * See the `Steps` subsection of the `Specifications` section of this prompt.
* Empty Line(s) 
  * One empty line if there are no context steps.
  * Two empty lines if there are context steps.
* Scenarios
  * See the `Scenario` subsection of the `Specifications` section of this prompt.
  * Must be at least one scenario per specification.
  * Must be one empty line between the last step of a scenario and the title of the next scenario.
* Optional: Tear Down Steps
  * See the `Steps` subsection of the `Specifications` section of this prompt.

#### Scenario
* Each scenario represents a single flow in a particular specification.
* Considered sequentially.

Scenario Structure:
* Descriptive Scenario Name
  * H4 with two-space indentation
* Scenario Description
  * One sentence, if possible.
  * Two-space indentation.
  * Not a bullet point.
* Empty Line
* Scenario-Level Tags
  * See the `Tags` subsection of the `Specifications` section of this prompt.
* Scenario Steps
  * Must be at least one step per scenario.
  * See the `Steps` subsection of the `Specifications` section of this prompt.

#### Tags
* Indentation:
  * Specification tags are not indented.
  * Scenario tags are two-space indented.

Tags Structure:
* A single line.
  * Starts with "Tags:".
  * The "Tags:" label is followed by the list of tags.
    * Each tag is preceded by a space.
    * Tags are separated by a comma (and a the space preceeding the second tag).
    * Tags must be all lowercase.
    * Each tag must be a single word.

#### Steps
* Each step contains a single instruction or describes a single piece of state.
* One step per bullet point.
  * More detail may be added with one level of indented bullet points.
* Considered sequentially.

##### Context Steps
* Steps declared between a specification description and the first scenario name are context steps.
* Optional section.
* Specify any states or sets of conditions that are necessary for executing the specification's scenarios.
* Considered before each of the specification's scenarios.

Examples:
* User is logged in as "mike"
  * If required, sign up for user "mike"
  * If required, log in as "mike"
* Navigate to the project page

##### Scenario Steps
* Steps declared with a scenario are scenario steps.

Examples:
* Delete the "example" project
* Ensure the "example" project has been deleted

##### Teardown Steps
* The start of the repeating teardown steps is indicated with a line containing three consecutive underscores.
  * Subsequent steps are repeating teardown steps.
  * Optional section.
  * Specify any clean-up steps required after every scenario in the specification.
  * Considered after each of the specification's scenarios.
* The start of the final teardown steps is indicated with a line containing seven consecutive underscores.
  * Subsequent steps are final teardown steps.
  * Optional section.
  * Specify any clean-up steps required after consideration of the final scenario and the subsequent repeating teardown steps.
  * Considered only after the final scenario and the subsequent repeating teardown steps.

Examples:
* Logout user "mike"
* Delete user "mike"

### Style

#### First Party Docs

#### Third Party Docs

#### Prompt Files

#### README Files

#### UI Style

#### Code Style

##### Type Declarations

##### React Components Code
* Always use functional components.

##### Other Code Style
* Prefer double quotes over single quotes.
* Prefer spaces over tabs for whitespace in code (not in UI).

#### Other Style
* Always use Oxford commas in prose (comments/documentation/etc) (not in code).

## Steps To Complete