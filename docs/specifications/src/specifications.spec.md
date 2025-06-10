# Directories

## app
- Next.js App Router directory containing API routes for the GameBanana mirror.

## components
- Contains all React components, other than route-specific components.

## consts
- Contains constant values that don't belong anywhere more specific.

## hooks
- Contains React hooks for state management and API interactions.

## logger
- Contains the configuration for loggers using Pino.

## pages
- Next.js Pages Router directory where folder structure defines HTTP route structure.

## server
- Contains the bulk of the server-side logic including API, authentication, and data processing.

## styles
- Contains CSS files and styling-related constants.

## utils
- Contains helper functions that don't belong in a more specific folder.

# Files

## emotionCache.ts
- Configures the Emotion cache for styling React components.

## env.mjs
- Environment variable validation created by t3 App (not currently functional/maintained).


# Common Specifications

## Website Architecture

High-level architecture of the CelesteMods website application.

Tags: architecture, structure, overview

- The application is built using Next.js framework
- The database is accessed through Prisma ORM
- The frontend uses React components with Mantine UI library

  ### Core Website Structure
  Describes the overall structure and navigation flows of the CelesteMods website.

    Tags: structure, navigation

  - Navigate to the CelesteMods website
  - Observe the main navigation elements
  - Verify the presence of homepage, mod listings, and search functionality
  - Check for proper links to external resources like GameBanana

  ### Data Flow
  Describes how data flows between the frontend, backend, and database.

    Tags: dataflow, api

  - User interacts with the frontend React components
  - Frontend components make API calls to backend endpoints
  - Backend endpoints query the database through Prisma ORM
  - Results are returned to the frontend
  - Frontend updates the UI with the received data
