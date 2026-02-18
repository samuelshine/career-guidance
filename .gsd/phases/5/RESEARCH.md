# Phase 5 Research: Polish & Verify

## Objectives
1. **Production Hardening**: Ensure the app is robust against errors and edge cases.
2. **Performance**: Inspect latency in Agent interactions (Market, Hiring).
3. **Verification**: Automated E2E verification of critical paths.

## Strategy

### 1. Error Handling (UI)
- **Problem**: Currently, API errors might just log to console or show generic alerts.
- **Solution**: Implement a `Toast` system (shadcn/ui `sonner` or `use-toast`) for:
  - Branch creation failures.
  - Merge conflicts.
  - Network timeouts.

### 2. Performance Tuning (Caching)
- **Problem**: `MarketAnalyst` and `HiringCommittee` calls are expensive and slow (LLM + Search).
- **Solution**:
  - **Backend Caching**: Cache `MarketInsight` for a role for 24 hours (InMemory or File-based).
  - **Optimistic UI**: Frontend should show "Analyzing..." states better (already partially done).

### 3. E2E Testing
- **Tool**: `pytest` + `TestClient` (FastAPI) is sufficient for logic.
- **Scope**:
  - Full flow: Register -> Create Branch -> Check Status -> Resolve Conflict -> Merge.
  - This verifies the "Happy Path" end-to-end.
