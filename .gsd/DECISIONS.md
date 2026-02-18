# DECISIONS.md (Architecture Decision Records)

## ADR-001: JSON File Storage for Multi-Tenancy
**Status**: Accepted
**Date**: 2026-02-17
**Context**: We need to support multiple users but sticking to file-based storage for minimal operational overhead.
**Decision**: We will use a directory structure `data/users/{username}.json` to store each user's `CareerState` independently.
**Consequences**: 
- No ACID transactions across users (acceptable).
- Simple backup/restore (just copy files).
- Zero database setup required.

## ADR-002: Agentic Architecture
**Status**: Accepted
**Date**: 2026-02-17
**Context**: Complex career advice requires different "personas".
**Decision**: We will use distinct LangChain agents (Ingestor, Market Analyst, Coach, Recruiter) rather than one monolithic prompt.
**Consequences**:
- Modular prompt engineering.
- Easier to test individual agents.
- Higher latency (multiple LLM calls), mitigated by async UI.
