# Directories

## appRouter
- Utilities specific to the Next.js App Router.

# Files

## api.ts
- Utility functions for API calls and data handling.

## checkSubarray.ts
- Function to check if an array contains a specific subarray.

## getNonEmptyArray.ts
- Utility for ensuring arrays are not empty or providing a default.

## getOrdinal.ts
- Function to convert a number to its ordinal representation (1st, 2nd, 3rd, etc.).

## randomValueGenerators.ts
- Functions for generating random values for testing or initial states.

## regex.ts
- Common regular expressions used throughout the application.

## truncateString.ts
- Function to truncate strings to a specified length with ellipsis.

## typeGuards.ts
- TypeScript type guard functions for runtime type checking.

## typeHelpers.ts
- Helper types and type utilities for TypeScript.

# Common Specifications

## Utility Function Design

Defines the principles and patterns for utility functions.

Tags: utilities, functions, helpers

- Utilities follow a functional programming approach where possible
- Functions are pure when appropriate (no side effects)
- Functions are well-typed with TypeScript
- Functions include JSDoc comments describing their purpose and parameters
- Error handling is consistent across utility functions

#### Function Reusability
Describes how utility functions are designed for reuse.

  Tags: reusability, design-patterns

- Functions handle a single responsibility
- Functions are organized by domain or purpose
- Functions use generics for type flexibility when appropriate
- Functions are exported individually to allow tree-shaking