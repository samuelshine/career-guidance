---
phase: 2
plan: 2
wave: 2
---

# Plan 2.2: Integrate Market Reality

## Objective
Connect the `MarketAnalyst` to the `BranchingEngine` so new branches automatically get market data, and display this data in the Frontend.

## Context
- backend/main.py
- backend/agents/branching.py
- frontend/src/types.ts (if exists) or components/BranchCard.tsx

## Tasks

<task type="auto">
  <name>Wire Analyst to Branch Creation</name>
  <files>
    backend/main.py
  </files>
  <action>
    - Update `create_branch` endpoint to:
      1. Call `market_analyst.analyze_role(target_role)`.
      2. Store result in `new_branch.market_insight`.
    - Note: This might slow down branch creation. For MVP, synchronous is fine. For better UX, maybe background task? Stick to synchronous for simplicity first (up to 5-10s delay).
  </action>
  <verify>
    grep "market_analyst.analyze_role" backend/main.py
  </verify>
  <done>
    Branch creation now fetches market data.
  </done>
</task>

<task type="auto">
  <name>Update Frontend Display</name>
  <files>
    frontend/src/lib/api.ts
    frontend/src/components/BranchCard.tsx (or equivalent)
  </files>
  <action>
    - Update `Branch` interface in `frontend/src/lib/api.ts` to include `market_insight`.
    - Update UI component (presumably `BranchCard` used in `Dashboard.tsx` or `RealityGraph`) to show:
      - Salary Badge (e.g. "$120k").
      - Demand Badge (High/Med/Low color coded).
      - "Market Reality" section with trends.
  </action>
  <verify>
    grep "market_insight" frontend/src/lib/api.ts
  </verify>
  <done>
    Frontend is aware of new fields and displays them.
  </done>
</task>

## Success Criteria
- [ ] Creating a branch for "Cobol Developer" shows "Low Demand" (hopefully).
- [ ] Creating a branch for "AI Engineer" shows "High Demand".
