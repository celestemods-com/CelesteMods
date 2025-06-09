# Directories

# Files

### GameBanana API Hooks

Custom React hooks for interacting with the GameBanana API.

Tags: hooks, gamebanana, api

- Provides hooks for fetching data from GameBanana
- Manages loading, error, and success states
- Handles caching and revalidation of GameBanana data
- Implements error handling specific to GameBanana API

#### Data Fetching
Describes how hooks fetch data from GameBanana.

  Tags: fetching, data

- Hooks use appropriate fetch methods for GameBanana endpoints
- Data is cached for performance
- Cache invalidation is handled automatically
- Loading states are managed for UI feedback

#### Error Handling
Describes how GameBanana API errors are handled.

  Tags: errors, resilience

- API errors are properly caught and formatted
- Retry logic is implemented for transient failures
- Fallback strategies are used when appropriate
- Error states provide useful information to the UI
