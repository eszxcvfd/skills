# Workflow (short)

1. Inventory project skills → pick one that fits → PLAN → **user y/n**
2. Reuse idle worker or `agent start` → `agent send` + `send-keys Enter`
3. `agent wait --status idle` → `agent read` + STATUS + artifacts
4. Evaluate → NEXT PLAN or FINISH → **user y/n**
5. Close workers you won't reuse (no ask) → loop or stop

**Don't:** auto-chain, skip ingest, invent skill names, close foreign panes, ask permission to close your own finished workers.
