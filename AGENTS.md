## Repository authority

- This file is the source of truth for agent behavior in this repo.
- If a skill, prompt, or workflow instruction conflicts with this file, this file wins.
  - Each conflict must be raised with the user for resolution before proceeding.
  - If the user specifically instructs the agent to proceed despite a conflict, follow the user's direction.
  - See `docs/agents/response-guidance.md` for details on conflicts.

## Agent skills

### Issue tracker

Local markdown issues live under `.scratch/<feature-slug>/` and are tracked as issue files rather than GitHub issues. See `docs/agents/issue-tracker.md`. Always reference this file when the `/wayfinder` skill is used.

### Triage labels

Uses the default canonical triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo layout: one root `GLOSSARY.md` plus `docs/adr/` for domain decisions. See `docs/agents/domain.md`.

### Troubleshooting docs

General debugging guidance for async fetch/redirect issues and end-user behavior checks. See `docs/agents/debugging.md`.

### Response guidance

In every user-facing response, include a final `Next steps` section with at least one clear action the developer can take. This can be an action (run a command, review output, answer a question), a suggested skill to call, or a recommendation to continue in a new session.

If there are multiple valid next steps, present a short numbered list.

### Default skill routing

When a task matches a Matt Pocock skill, always use the matching skill. If no skill matches, then consider improvising a custom workflow, but always ask for guidance or confirmation before proceeding.

- Broken, failing, throwing, or slow behavior: `/diagnosing-bugs`
- Feature idea or scoped build in this repo: `/grill-with-docs`
- No repo / general idea outside the working directory: `/grill-me`
- Async fetch / redirect / conditional-render debugging: `/diagnosing-bugs`
  - When using `/diagnosing-bugs`, follow the guidance in `docs/agents/debugging.md`.
- Test-first build or bug fix: `/tdd`
- Review a branch, PR, or WIP diff: `/code-review`
- Need primary-source facts before deciding: `/research`
- Need to improve the process or environment after a session: `/retro`
- Writing or editing AGENTS.md, skills, or other agent-facing docs: `/writing-for-agents`
