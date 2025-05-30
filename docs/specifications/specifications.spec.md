# Directories

## .github
- Contains GitHub-specific files and configurations for the repository.

## .vscode
- Contains Visual Studio Code editor configuration and recommended settings.

## docs
- Contains documentation files for the project. Documentation for this directory is in its README files.

## logs
- Contains application log files.

## node_modules
- Contains npm package dependencies. This directory is excluded from git and specifications.

## prisma
- Contains Prisma ORM configuration files and database migrations.

## public
- Contains static assets served by Next.js.

## src
- Contains the Next.js application source code.

# Files

## .env.example
- Example environment file showing required environment variables without actual secrets.

## .eslintrc.cjs
- ESLint configuration file. Currently not actively used in the project.

## .gitignore
- Specifies files and directories to be excluded from git version control.

## CONTRIBUTING.md
- Guidelines for contributing to the CelesteMods project.

## LICENSE.md
- License information for the CelesteMods project.

## next-env.d.ts
- TypeScript declarations for Next.js.

## next.config.mjs
- Next.js configuration file.

## package-lock.json
- Auto-generated file that locks npm dependency versions.

## package.json
- Defines project metadata, dependencies, and scripts.

## README.md
- Main project documentation with overview, setup instructions, and links.

## SECURITY.md
- Security policy and vulnerability reporting information.

## tsconfig.json
- TypeScript configuration file.

### CelesteMods Website
A website for listing, searching, and discovering Celeste mods.

Tags: website, nextjs

- The website is accessible
- User has a web browser

#### Browse Mods
User can view a list of available Celeste mods.

  Tags: mods, list
- Navigate to the mods page
- View the list of mods
- Filter mods by various criteria
- Sort mods by different properties

#### Search Mods
User can search for specific mods.

  Tags: mods, search
- Navigate to the mods page
- Enter search terms in the search field
- View filtered results based on search terms

#### View Mod Details
User can view detailed information about a specific mod.

  Tags: mods, details
- Navigate to a specific mod page
- View mod metadata (author, difficulty, etc.)
- View mod description and images
- View mod ratings and comments

#### Access GameBanana Mirror
User can access the CML GameBanana Mirror for mod downloads.

  Tags: mirror, downloads
- Navigate to the GameBanana Mirror section
- Select a mod to download
- Download mod files from the mirror server
