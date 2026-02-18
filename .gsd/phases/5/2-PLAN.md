# Plan 5.2: Performance Tuning (Caching)

## Objective
Reduce latency and API costs for repetitive expensive operations (Market Analysis, Hiring Committee).

## Tasks
1. [MODIFY] `backend/agents/market_analyst.py`:
   - Implement `check_cache(role)` function using simple dict or file-based cache.
   - Cache key: `role` (normalized).
   - TTL: 24 hours.

2. [MODIFY] `backend/agents/hiring_committee.py`:
   - Cache results for same `branch_id` and conflict state?
   - Actually, simpler caching: If user re-checks same branch without changes, return previous report.
   - Key: `(branch_id, conflict_hash)`.

3. [VERIFY] Manual check: Run "Check Hiring Status" twice -> Second time instant.
