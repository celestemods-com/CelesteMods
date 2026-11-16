# Debugging Playbook

This file is a supplement to the general `/diagnosing-bugs` workflow but is not a replacement for it.

## Proof Source Guidance

Use the right tool for the right source of truth:

- **Browser**: for user-visible behavior.
- **MySQL MCP**: for database truth.
- **Terminal**: as a fallback when MCP-based verification is unavailable.

## Specific Patterns

### Async Fetch / Conditional Render
- **Rule**:If a page, route, or flow redirects or renders conditionally based on fetched state, treat `loading` as a distinct state from `empty` / `unauthenticated` / `not found`. Do not redirect on the initial render before the async fetch has resolved.
- **Explanation**: This repo has had cases where the app treated an initial empty state as a final negative state, causing a redirect before the session/data fetch completed. The correct gate is: Redirect only after the relevant fetch resolves, not while the state is still loading.
