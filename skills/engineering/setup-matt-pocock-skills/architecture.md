# System Architecture

This file answers: **how is the system divided, and where should new code go?**

Keep it as an owner map and routing guide, not a full design document. Hard-to-reverse changes to this file should go through `/architecture-council` or an ADR.

## Modules

### <Module name>

Owns:

- <business capability>
- <data it owns>

May depend on:

- <module or layer>

Must not depend on:

- <module or layer>

Public contract:

- <interfaces/routes/events other modules may use>

Internal implementation:

- <files/classes/tables other modules must not reach into>

## Request flow

```text
HTTP Request
→ Controller / Route
→ Application Service
→ Domain
→ Repository
→ Database
```

## Event / job flow

```text
Producer
→ Queue / Scheduler
→ Worker
→ Application Service
→ Domain
→ Repository
→ Database
```

## Dependency rules

- Business logic lives in domain or application services, not controllers, routes, UI, jobs, or workers.
- A module may only modify data it owns.
- Cross-module access goes through the public contract named above.
- New long-lived modules, ownership changes, dependency-direction changes, service splits, or request-flow changes require `/architecture-council` or an ADR.
