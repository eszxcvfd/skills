# Example: Livestream discovery module split

## Case

```yaml
decision: "How should modules be split for livestream discovery?"
current_state: "NestJS modular monolith"
constraints:
  - small team
  - single-server deployment first
  - high-volume ingestion later
non_goals:
  - no multi-region
  - no microservices now
risk_score:
  irreversibility: 2
  blast_radius: 3
  operational_impact: 1
  data_migration_risk: 1
  novelty: 1
  total: 8
council_required: true
```

## Options considered

- Modular monolith with domain modules.
- Core API plus separate ingestion process boundary.
- Internal event-driven architecture.
- Microservices split by ingestion pipeline.

## Verdict

```yaml
decision: "Modular monolith with a guarded ingestion process boundary"
status: accepted
confidence: 0.82
lock_level: locked
why:
  - fits the current small team and one-server deployment
  - preserves a clear path to scale ingestion separately
  - avoids premature distributed complexity
rejected:
  microservices:
    reason: "Operational cost is not justified yet."
  fully_event_driven:
    reason: "Debug cost is high and most workflows are still simple CRUD."
guardrails:
  - modules do not import repositories from other modules
  - cross-module communication goes through application services or explicit contracts
  - ingestion owns collection mechanics, not business rules
  - events are for asynchronous side effects only
reopen_when:
  - ingestion must run more than three workers independently
  - API deployment repeatedly interrupts ingestion
  - module boundaries cannot be maintained without exceptions
```
