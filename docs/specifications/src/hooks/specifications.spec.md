# Directories

## gamebananaApi
- Custom hooks for interacting with the GameBanana API.

## globalContexts
- Hooks related to global React context providers and consumers.

# Files

## useFetch.ts
- Custom hook for fetching data with built-in loading, error, and success states.

# Common Specifications

## Custom Hooks

Defines the structure and behavior of custom React hooks.

Tags: hooks, react, state-management

- Hooks follow React's custom hook naming convention (use*)
- Hooks handle their own loading and error states
- Hooks are designed for reusability across components
- Hooks maintain type safety with TypeScript

#### Hook Lifecycle
Describes the lifecycle and side effects of custom hooks.

  Tags: lifecycle, effects

- Hook initializes with default values
- Hook manages its own state and effects
- Hook handles cleanup when component unmounts
- Hook optimizes re-renders with appropriate dependencies