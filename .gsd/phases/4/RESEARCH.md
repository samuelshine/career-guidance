# Phase 4 Research: Board of Directors

## Goal
Implement a multi-agent "Hiring Committee" where three distinct personas debate the user's readiness for a target role.

## Architecture
**Sequential Simulation:**
1. **Technical Interviewer**: Scrutinizes technical skills (hard skills) and resolved conflicts (patches).
   - FOCUS: Technical depth, practical application (resolved conflicts), stack alignment.
   - OUTPUT: Technical validation score + comments.
2. **HR Manager**: Assesses cultural fit and foundational skills (soft skills, resume completeness).
   - FOCUS: Communication, completeness, career progression logic.
   - OUTPUT: Culture fit score + comments.
3. **Hiring Manager**: Makes the final GO/NO-GO decision based on Technical + HR inputs and market demand.
   - FOCUS: Risk vs Reward, market urgency (from Market Reality Engine), final verdict.
   - OUTPUT: Final Decision (HIRE/NO_HIRE), Salary Offer (if HIRE), Feedback.

## Data Flow
- **Input**:
  - `User Profile` (Current Role, Skills).
  - `Resolved Conflicts` (Proof of learning from Git History).
  - `Market Insight` (Salary, Demand).
- **Process**: Chain of 3 Agents (Sequential).
- **Output**: `HiringCommitteeReport` (JSON).

## Interface Changes
**Backend (`backend/agents/hiring_committee.py`)**:
- New class `HiringCommittee`.
- Method `evaluate(state: CareerState, insight: MarketInsight) -> Report`.

**Frontend (`frontend/components/RecruiterDialog.tsx`)**:
- Display the "Debate" step-by-step (typing effect?).
- Show final "Offer Letter" or "Rejection" with specific feedback.
