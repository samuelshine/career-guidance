# Plan 5.3: Automated E2E Verification

## Objective
Implement a comprehensive end-to-end test suite that verifies the entire user journey from registration to job offer simulation.

## Tasks
1. [NEW] `backend/tests/e2e/test_full_flow.py`:
   - `test_registration_login`: Verify auth flow.
   - `test_branch_creation`: Verify market data fetching.
   - `test_conflict_resolution`: Verify patch logic.
   - `test_merge_and_rollback`: Verify git graph integrity.
   - `test_hiring_committee`: Verify debate simulation returns valid JSON.

2. [VERIFY] Run `pytest backend/tests/e2e/test_full_flow.py` and ensure 100% pass rate.
