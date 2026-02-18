# ROADMAP.md

> **Current Phase**: Phase 4 Complete
> **Milestone**: v2.0 "Market Reality & Team"

**Current Position**: Phase 4 Complete (Board of Directors)
**Task**: Planning Phase 5
**Status**: Ready to plan "Polish & Verify"
**Next Steps**: /plan 5

## Must-Haves (from SPEC)
- [ ] Multi-User Isolation & Auth
- [ ] Live Market Data Integration
- [ ] Interactive Git Graph Visualization
- [ ] Hiring Committee (Multi-Agent Debate)

## Phases

### Phase 1: Foundation (Auth & Multi-Tenancy)
**Status**: ✅ Complete
**Objective**: Secure the platform with real authentication and user data isolation.
**Requirements**: REQ-01, REQ-02
- Implement `User` model with password hashing.
- Refactor `JSONDatabase` to handle multiple user files/keys.
- Update `auth.py` to enforce stateless JWT validation.
- E2E Test: Registration -> Login -> Private Data Access.

### Phase 2: Market Reality Engine
**Status**: ✅ Complete
**Objective**: Ground the AI advice in live job market data.
**Requirements**: REQ-03, REQ-08
- Create `MarketAnalyst` agent with search tool access.
- Integrate market data into `BranchingEngine` (creating a branch fetches meaningful salary/demand data).
- Update frontend to display "Market Health" indicators on branches.

### Phase 3: The Git Workflow
**Status**: ✅ Complete
**Objective**: Fully realize the Git metaphor in the UI and Logic.
**Requirements**: REQ-04, REQ-05
- Implement visual "Commit History" graph (interactive).
- Build "Patch Execution" UI (checking off learning items).
- Implement "Merge" logic (Patch completion -> Skill update).
- Support "Revert" (Rollback) with visual confirmation.


### Phase 4: Board of Directors
**Status**: ✅ Complete
**Objective**: Turn the single-agent chat into a multi-agent debate.
**Requirements**: REQ-06
- Refactor `check_headhunt_status` to run a "Hiring Committee" simulation.
- Agents (Technical, HR, Hiring Manager) debate the user's readiness in a structured log.
- Final "Decision" output based on the debate consensus.

### Phase 5: Polish & Verify
**Status**: ⬜ Not Started
**Objective**: Production hardening and final polish.
**Requirements**: REQ-07, REQ-08
- Comprehensive E2E test suite (Playwright/Python).
- Error handling audit (UI toasts for all failures).
- Performance tuning (parallel agent calls).
