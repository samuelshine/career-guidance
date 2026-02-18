---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: Secure Authentication Implementation

## Objective
Implement robust JWT authentication with password hashing, checking against a secure user store, and enforcing auth on all endpoints.

## Context
- .gsd/SPEC.md (REQ-02)
- backend/auth.py
- backend/models.py
- backend/main.py

## Tasks

<task type="auto">
  <name>Secure User Model & Storage</name>
  <files>
    backend/models.py
    backend/database.py
  </files>
  <action>
    - Update `UserInDB` in `models.py` to ensure it has `hashed_password`.
    - Create `UserDatabase` class (or method in `JSONDatabase`) to manage reading/writing `backend/data/users.json` (global user registry).
    - Ensure `backend/data/users.json` stores stored users with hashed passwords (bcrypt).
  </action>
  <verify>
    python3 -c "from backend.models import UserInDB; print(UserInDB.__fields__.keys())"
  </verify>
  <done>
    User model supports password hashing and user registry file is established.
  </done>
</task>

<task type="auto">
  <name>Harden Auth Logic</name>
  <files>
    backend/auth.py
    backend/.env.example
  </files>
  <action>
    - Move `SECRET_KEY` value to `os.getenv("JWT_SECRET_KEY")`.
    - Update `.env.example` to include `JWT_SECRET_KEY`.
    - Ensure `verify_password` and `get_password_hash` use `bcrypt` correctly.
    - Replace `datetime.utcnow()` with `datetime.now(timezone.utc)` (deprecation fix).
  </action>
  <verify>
    grep "JWT_SECRET_KEY" backend/auth.py
  </verify>
  <done>
    Auth module reads secret from env and uses modern datetime methods.
  </done>
</task>

<task type="auto">
  <name>Enforce Auth on Endpoints</name>
  <files>
    backend/main.py
  </files>
  <action>
    - Ensure `get_current_user` dependency is used on ALL protected routes.
    - Update `/register` endpoint to:
      1. Check if user exists.
      2. Hash password.
      3. Save to user registry.
      4. Initialize empty `CareerState` for that user.
    - Update `/token` (login) to verify hash against registry.
  </action>
  <verify>
    # Check that register endpoint calls hash function
    grep "get_password_hash" backend/main.py
  </verify>
  <done>
    Registration creates hashed user records + isolated state file using Plan 1.1 logic.
  </done>
</task>

## Success Criteria
- [ ] Passwords are never stored in plain text.
- [ ] JWT tokens are signed with env-var secret.
- [ ] Users can register and login.
