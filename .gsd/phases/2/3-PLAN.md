---
phase: 2
plan: 3
wave: 3
---

# Plan 2.3: Verify Market Reality

## Objective
Verify the end-to-end flow of Market Reality features using automated tests.

## Context
- backend/tests/test_market_integration.py (New)

## Tasks

<task type="auto">
  <name>Integration Test for Market Data</name>
  <files>
    backend/tests/test_market_integration.py
  </files>
  <action>
    - Create test that:
      1. Mocks `MarketAnalyst.analyze_role` to return fixed data (so we don't hit DDG in tests).
      2. Calls `/branch/create`.
      3. Asserts response contains `market_insight`.
      4. Asserts `salary_range` matches mock.
  </action>
  <verify>
    ls backend/tests/test_market_integration.py
  </verify>
  <done>
    Test file exists.
  </done>
</task>

## Success Criteria
- [ ] `pytest backend/tests/test_market_integration.py` passes.
