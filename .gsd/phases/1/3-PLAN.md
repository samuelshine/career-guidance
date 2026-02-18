---
phase: 1
plan: 3
wave: 2
---

# Plan 1.3: E2E Auth & Isolation Testing

## Objective
Verify the critical "Register -> Login -> Private Data" flow using automated tests to ensure multi-tenancy works as expected.

## Context
- .gsd/SPEC.md (REQ-07)
- backend/main.py
- New: backend/tests/test_auth_flow.py

## Tasks

<task type="auto">
  <name>Setup Test Environment</name>
  <files>
    backend/requirements.txt
    backend/tests/conftest.py
  </files>
  <action>
    - Add `httpx` and `pytest` to `backend/requirements.txt`.
    - Create `backend/tests/` directory.
    - Create `conftest.py` with fixtures to:
        - Spin up `TestClient` (FastAPI).
        - Override `JSONDatabase` path to use a temporary directory (cleanup after test).
  </action>
  <verify>
    test -d backend/tests && grep "httpx" backend/requirements.txt
  </verify>
  <done>
    Test infrastructure is ready.
  </done>
</task>

<task type="auto">
  <name>Write Isolation Test</name>
  <files>
    backend/tests/test_auth_flow.py
  </files>
  <action>
    Create a test file `backend/tests/test_auth_flow.py` that:
    1. Registers User A ("Alice").
    2. Registers User B ("Bob").
    3. Alice logs in -> Gets Token A.
    4. Bob logs in -> Gets Token B.
    5. Alice creates a branch "Alice-Branch".
    6. Bob requests `/state` with Token B.
    7. ASSERT: Bob's state does NOT contain "Alice-Branch".
    8. ASSERT: Bob cannot access Alice's data.
  </action>
  <verify>
    ls backend/tests/test_auth_flow.py
  </verify>
  <done>
    Test file exists and covers the multi-tenant isolation scenario.
  </done>
</task>

## Success Criteria
- [ ] Running `pytest` passes.
- [ ] Confirms that User A cannot see User B's data.
