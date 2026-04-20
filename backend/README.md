# Backend — CareerOps API

> FastAPI-powered REST API with 7 specialized AI agents for career guidance.

---

## Overview

The backend is a **FastAPI** application that serves as the brain of CareerOps. It orchestrates a team of AI agents (powered by Google Gemini via LangChain) and exposes REST endpoints for the React frontend to consume.

### Key Responsibilities

- **User Authentication** — JWT-based registration/login with bcrypt hashing
- **Career State Management** — CRUD operations on a user's career state (skills, branches, history)
- **AI Agent Orchestration** — Routing requests to the appropriate agent and returning structured responses
- **Version Control Logic** — Commit history, rollback, branching, and merging of career states
- **Data Persistence** — JSON file-based storage (one file per user)

---

## File Reference

| File | Purpose |
|---|---|
| `main.py` | Application entry point. Defines all API routes and initializes agents. |
| `models.py` | Pydantic models: `CareerState`, `Branch`, `Conflict`, `Skill`, `Commit`, `Patch`, `MarketInsight`, `User`, `Token` |
| `database.py` | `JSONDatabase` class — file-based persistence layer using `data/users/{username}.json` |
| `auth.py` | JWT token creation/validation and bcrypt password hashing |
| `seed_data.py` | Seeds the database with a demo user ("Alex Chen") and 4 pre-built branches with 7 conflicts |
| `requirements.txt` | Python dependencies |
| `.env.example` | Template for environment variables |
| `agents/` | Directory containing all 7 AI agents ([details](agents/README.md)) |
| `tests/` | Unit tests and E2E tests |

---

## Data Models

The core data models follow the Git metaphor:

```
CareerState
├── user_id, full_name, current_role
├── skills: List[Skill]              # name, category (Hard/Soft/Domain), proficiency (0.0-1.0)
├── experience: List[str]            # Past role titles
├── branches: Dict[str, Branch]      # Career paths keyed by UUID
│   └── Branch
│       ├── name, target_role, job_description
│       ├── market_insight: MarketInsight    # salary, demand, trends, top_skills
│       └── conflicts: List[Conflict]       # Skill gaps
│           └── Conflict
│               ├── missing_skill, severity (CRITICAL/WARNING)
│               └── suggested_patch: Patch  # Action items, estimated hours, resources
├── active_branch_id: str
└── history: List[Commit]            # Version control timeline
    └── Commit
        ├── message, timestamp
        ├── parent_hash, merge_parent_hash  # DAG pointers
        └── snapshot: Dict                  # Full state snapshot at commit time
```

---

## Database

The app uses a **JSON file database** for simplicity (hackathon/MVP scope):

```
data/
├── users.json          # Username → hashed credentials mapping
└── users/
    ├── demo.json       # Full CareerState for user "demo"
    └── {username}.json # One file per registered user
```

The `JSONDatabase` class in `database.py` provides:
- `load_state(username)` / `save_state(state, username)` — Career state CRUD
- `get_user(username)` / `save_user(user_data)` — User credential management
- `get_branch(username, branch_id)` — Branch lookup

---

## Authentication Flow

1. **Register** → `POST /register` → Creates user in `users.json` + initializes empty `CareerState`
2. **Login** → `POST /token` → Validates credentials, returns JWT (30-min expiry)
3. **Protected Routes** → Include `Authorization: Bearer <token>` header → Decoded by `get_current_user` dependency

---

## Running

```bash
# Setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set GOOGLE_API_KEY

# Optional: seed demo data
python seed_data.py

# Start server
uvicorn main:app --reload --port 8000

# API docs available at http://localhost:8000/docs
```

---

## Testing

```bash
# Activate venv first
source venv/bin/activate

# Run all tests
pytest -v

# Individual test suites
pytest tests/test_auth_flow.py -v         # Auth registration/login
pytest tests/test_git_logic.py -v         # Branching, merging, rollback
pytest tests/test_hiring_committee.py -v  # Hiring committee simulation
pytest tests/test_market_integration.py -v # Market analyst integration
pytest tests/e2e/test_full_flow.py -v     # Full user journey E2E
```

Tests use a `test_db` fixture that temporarily redirects the database to a `test_data/` directory, ensuring isolation from production data.

---

## Environment Variables

Create a `.env` file from `.env.example`:

```env
GOOGLE_API_KEY=your-google-api-key-here
JWT_SECRET_KEY=a-secure-random-string

# Optional: LangSmith observability
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your-langsmith-key
LANGCHAIN_PROJECT=CareerOps-MVP
```
