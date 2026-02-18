# REQUIREMENTS.md

## Format
| ID | Requirement | Source | Status |
|----|-------------|--------|--------|
| REQ-01 | **Multi-User Data Isolation**: The system must support multiple users, storing their data in separate JSON files or isolated keys, ensuring no data leaks between users. | Goal 4 | Pending |
| REQ-02 | **Secure Auth**: Implement JWT-based authentication with secure password hashing (bcrypt) and session expiry. | Goal 4 | Pending |
| REQ-03 | **Market Analyst Agent**: A new agent that uses search tools to inject *live* job market context (salary trends, demand volume) into the Branching analysis. | Goal 3 | Pending |
| REQ-04 | **Interactive Git Graph**: The frontend must visualize the career "tree" (history + current branches) interactively, allowing clicks to view commit details. | Goal 2 | Pending |
| REQ-05 | **Patch Execution**: Users must be able to "progress" a Patch (mark items done) and "Merge" it, updating their main profile skills. | Goal 2 | Pending |
| REQ-06 | **Recruiter "Board" Mode**: The existing Recruiter agent should be expanded to offer "Hiring Committee" debates (e.g., one agent argues for hire, one against). | Goal 1 | Pending |
| REQ-07 | **E2E Testing**: Automated tests using Playwright/Cypress (or Python equivalent) to verify the "Login -> Upload -> Branch" flow. | Goal 1 | Pending |
| REQ-08 | **Error Recovery**: The backend must handle LLM failures gracefully (retries, fallback static logic) without crashing the user experience. | Goal 1 | Pending |
