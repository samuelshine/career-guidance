# Plan 4.1: Hiring Committee Backend

## Objective
Implement the "Board of Directors" simulation in the backend, replacing the single recruiter agent with a multi-agent committee (Technical, HR, Hiring Manager).

## Tasks
1. [NEW] `backend/agents/hiring_committee.py`:
   - Define `HiringReport` Pydantic model (debate_log: List[Dict], final_decision: bool, salary: str, feedback: str).
   - Implement `HiringCommittee` class with method `evaluate`.
   - Sequential chain:
     - Technical Agent: Validates skills.
     - HR Agent: Validates fit.
     - Hiring Manager: Decides based on Technial + HR + Market Reality.

2. [MODIFY] `backend/main.py`:
   - Replace `recruiter_agent` usage in `check_headhunt_status` endpoint with `HiringCommittee.evaluate`.
   - Ensure response returns `HiringReport`.

3. [VERIFY] `backend/tests/test_hiring_committee.py`:
   - Verify report structure.
   - Verify decision logic (missing critical skills -> NO_HIRE).
