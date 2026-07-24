# Example: Queue selection

## Case

```yaml
decision: "Should background email delivery use an external queue now?"
current_state: "Rails app with Postgres and a single web process"
constraints:
  - team already operates Postgres
  - email volume is low but retries matter
  - deployment must stay simple
non_goals:
  - no cross-service event bus
  - no exactly-once delivery guarantee
risk_score:
  irreversibility: 1
  blast_radius: 2
  operational_impact: 2
  data_migration_risk: 0
  novelty: 1
  total: 6
council_required: true
```

## Boring standard question

Why not use the framework's built-in background job adapter backed by the database before adding Redis, SQS, or Kafka?

## Verdict shape

```yaml
decision: "Use the framework job abstraction with Postgres-backed jobs; do not introduce a new queue service yet."
lock_level: guarded
guardrails:
  - every job is idempotent
  - retries use bounded exponential backoff
  - poison jobs are visible in an admin view or log alert
  - no event bus language for ordinary background jobs
reopen_when:
  - job throughput exceeds what the database-backed queue can process within the SLA
  - jobs need independent worker autoscaling
  - another bounded context must consume the same durable event stream
```
