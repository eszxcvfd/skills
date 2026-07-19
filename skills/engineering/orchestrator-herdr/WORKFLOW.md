# Workflow

1. Route goal → **many** jobs (right project skill each) → PLAN → user y
2. Per job: read SKILL.md → put requirements in prompt → spawn/reuse worker → send+Enter
3. Parallel if no depends; else wait upstream first
4. On **each** stop: transcript + STATUS + open artifacts → quality-gate → ORCH
5. More approved jobs → dispatch; else NEXT PLAN / FINISH → user y
6. Close workers not reused (no ask)

**Fail if:** treat idle as done, skip opening artifacts, prompt without SKILL_REQUIREMENTS, invent skills, auto-chain past approve.
