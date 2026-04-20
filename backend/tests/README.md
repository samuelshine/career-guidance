# Tests — Backend Test Suite

> Unit tests and End-to-End tests for the CareerOps backend.

---

## Test Structure

```
tests/
├── conftest.py                    # Shared fixtures (test_db, client)
├── test_auth_flow.py              # User registration and JWT login
├── test_git_logic.py              # Branching, merging, rollback, commit history
├── test_hiring_committee.py       # Hiring committee simulation
├── test_market_integration.py     # Market analyst integration
└── e2e/
    └── test_full_flow.py          # Full user journey: register → upload → branch → resolve → headhunt
```

---

## Fixtures

### `test_db` (scope: function)
Temporarily redirects the global `db` singleton to use a `test_data/` directory instead of `data/`. This ensures:
- Tests don't pollute production data
- Each test function gets a clean database
- Teardown automatically removes `test_data/`

### `client` (scope: function)
A `FastAPI TestClient` instance pre-configured with the isolated test database.

---

## Running Tests

```bash
cd backend
source venv/bin/activate

# Run all tests
pytest -v

# Run a specific file
pytest tests/test_auth_flow.py -v

# Run with output visible
pytest -v -s

# Run E2E tests only
pytest tests/e2e/ -v
```

---

## Test Coverage

| Suite | What It Tests |
|---|---|
| **Auth Flow** | Registration, login, token validation, duplicate user handling |
| **Git Logic** | Branch creation, branch merging, conflict resolution, state rollback, commit history integrity |
| **Hiring Committee** | Committee evaluation with various skill/conflict scenarios |
| **Market Integration** | Market analyst returns valid `MarketInsight` objects |
| **E2E Full Flow** | Complete user journey from registration through to recruiter headhunt |

> **Note:** Tests that invoke AI agents (hiring committee, market analyst) require a valid `GOOGLE_API_KEY` environment variable.
