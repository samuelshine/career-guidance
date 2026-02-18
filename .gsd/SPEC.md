# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
**CareerOps** is the definitive "Git for your Career" — a production-grade agentic pipeline that treats career development as a version-controlled engineering problem. It differentiates itself by integrating **Live Market Reality**, using agents to diff user profiles not just against static job descriptions, but against real-time market data. It empowers users to "fork" career paths, "commit" to learning plans, and "merge" new skills into their professional identity, all guided by a Board of Directors (AI Agents) that debate their future.

## Goals
1. **Production-Grade Agentic Pipeline**: Robust, multi-agent system (Ingestor, Market Analyst, Coach, Recruiter) with error handling, retries, and observability.
2. **"Git of Careers" Workflow**: Fully realized UI for Branching (Career Paths), Commits (Snapshots), Patches (Learning Plans), and Merges (Achievement).
3. **Live Market Reality Engine**: "Market Analyst" agent that fetches *real* job data/trends (via search/scraping) to ground advice in current reality, not just LLM training data.
4. **Secure Multi-User Foundation**: Real authentication, multi-user data isolation (even with JSON DB), and session management.

## Non-Goals (Out of Scope)
- **Migrating to SQL Database**: We will stick to file-based JSON storage for now (as requested), but structured for multi-tenancy.
- **Mobile App**: Focus is on a high-density Desktop/Tablet "Command Center" web interface.
- **Social Network Features**: No connecting with other users; focus is on the *individual's* board of directors.

## Users
- **Ambitious Professionals/Students**: Who treat their career as a project to be engineered, not a path to be discovered.
- **Bootcamp Grads**: Needing concrete "patches" to bridge gaps to employment.
- **Career Switchers**: Who need to "fork" their current state into a completely new branch.

## Constraints
- **Tech Stack**: React 19 (Vite), Python 3.14 (FastAPI), LangChain, Google Gemini 2.5 Flash Lite.
- **Database**: JSON Files (must handle concurrent writes safely or accept limitations).
- **Testing**: Must include E2E testing for critical flows.

## Success Criteria
- [ ] **Multi-User Login**: Users can register, login, and see *only* their own data.
- [ ] **Market-Aware Branching**: Creating a branch fetches *live* data (e.g., "React jobs in 2026") to inform the skill gap analysis.
- [ ] **Full Git Actions**: User can `commit` a state, `fork` a branch, and `merge` a patch successfully in the UI.
- [ ] **E2E Test Suite**: Critical user flows (Login -> Upload Resume -> Create Branch) are automated.
