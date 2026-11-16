# Instruction Conflicts

## Rules

- `AGENTS.md` is the source of truth for agent behavior in this repo.
- If a skill, prompt, or workflow instruction conflicts with `AGENTS.md`, `AGENTS.md` wins.
  - Each conflict must be raised with the user for resolution before proceeding.
  - The agent must not unilaterally override `AGENTS.md` guidance without explicit user approval.
    - Exception for response guidance: user memory preferences override `AGENTS.md` when they conflict only with its `### Response guidance` section.
  - If the user specifically instructs the agent to proceed despite a conflict, follow the user's direction.

## Conflict handling procedure
1. Detect whether the conflict is about response guidance only.
2. If yes, follow user memory and continue without blocking implementation.
3. Note the resolution in the response so the developer can confirm or adjust it.
4. If the conflict is not about response guidance, follow repository authority rules and ask the user to resolve the conflict.
