---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Multi-User Architecture Refactor

## Objective
Convert the current single-user `career_ops_db.json` storage associated with `JSONDatabase` into a directory-based multi-tenant system (`data/users/{username}.json`). This is the foundation for isolated user data.

## Context
- .gsd/SPEC.md (REQ-01)
- .gsd/ARCHITECTURE.md
- backend/database.py
- backend/models.py

## Tasks

<task type="auto">
  <name>Create User Data Directory</name>
  <files>
    backend/database.py
    backend/start.sh
  </files>
  <action>
    - Ensure `backend/data/users/` directory exists on startup.
    - Add `data/` to `.gitignore` to prevent committing user data.
    - Update `start.sh` to create this directory if missing (safety check).
  </action>
  <verify>
    test -d backend/data/users && grep "data/" .gitignore
  </verify>
  <done>
    Directory structure exists and is gitignored.
  </done>
</task>

<task type="auto">
  <name>Refactor JSONDatabase for Multi-Tenancy</name>
  <files>
    backend/database.py
    backend/main.py
  </files>
  <action>
    - Modify `JSONDatabase` class to accept `username` in methods like `load_state(username)` and `save_state(state, username)`.
    -  It should resolve file path as `backend/data/users/{username}.json`.
    - If user file doesn't exist, `load_state` should return a new default state or raise a specific error (handled by caller).
    - STARTUP CHECK: Migrate existing `career_ops_db.json` to a default user (e.g., `admin`) or archive it, to avoid breaking legacy state.
  </action>
  <verify>
    python3 -c "from backend.database import JSONDatabase; db = JSONDatabase(); print(hasattr(db, 'load_state'))"
  </verify>
  <done>
    Database class methods accept username argument and read/write to specific user files.
  </done>
</task>

## Success Criteria
- [ ] `career_ops_db.json` is no longer the single source of truth.
- [ ] Saving state for "alice" creates `backend/data/users/alice.json`.
- [ ] Loading state for "bob" does not see "alice's" data.
