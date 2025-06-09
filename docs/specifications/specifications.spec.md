# Directories

## .github
- Contains GitHub-specific files and configurations for the repository.

## .vscode
- Contains Visual Studio Code editor configuration and recommended settings.

## .next
- Contains Nextjs's outputs. Should generally be ignored, but sometimes may need to be considered if troubleshooting a bug that may be caused by Nextjs itself.

## docs
- Contains documentation files for the project. No specifications are created for this directory - README files are used instead.

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

## .env
- Environment file containing secrets. No AI/LLM should ever read this file.

## .env.example
- Example environment file showing required environment variables without actual secrets.

## .eslintrc.cjs
- ESLint configuration file. Currently not actively used in the project.

## .gitignore
- Specifies files and directories to be excluded from git version control. Files/folders excluded by git should usually be excluded from a prompt's context.

## CONTRIBUTING.md
- Guidelines for contributing to the Celeste Mods List project.

## LICENSE.md
- License information for the Celeste Mods List project.

## next-env.d.ts
- References TypeScript declarations for Next.js - not to be edited.

## next.config.mjs
- Next.js configuration file.

## package-lock.json
- Auto-generated file that locks npm dependency versions.

## package.json
- Defines project metadata, dependencies, and scripts.

## README.md
- Main project description with overview, setup instructions, and links.

## SECURITY.md
- Security policy and vulnerability reporting information.

## tsconfig.json
- TypeScript configuration file.