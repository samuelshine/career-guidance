# Research: The Git Workflow Structure

## Goal
Implement a true Git-like history visualization and interaction model for CareerOps.

## Current Architecture
- `CareerState.history` is a linear list of `Commit` objects.
- Each `Commit` contains a full `snapshot` of `CareerState`.
- `parent_hash` blindly points to the previous commit in the list.
- Branching/Merging just appends to this linear history.

## Gap Analysis
The current linear model fails to represent parallel development (branching) and convergence (merging). A "Commit Graph" visualization of this would be a single straight line, defeating the purpose of the "Git for Careers" metaphor.

## Proposed Design

### 1. Data Model Enhancements (Backend)
Update `Commit` model in `backend/models.py`:
- `branch_id: str`: Explicitly link commits to a specific branch.
- `merge_parent_hash: Optional[str]`: Support dual-parent commits for true merge representation.

### 2. Logic Updates (Backend)
- `create_branch`: Fork from current HEAD, start new lineage with `branch_id`.
- `resolve_conflict` (Patch): Commit to `active_branch_id`.
- `merge_branches`: Create a commit with two parents (`HEAD of Branch A`, `HEAD of Branch B`).
- `rollback_state`: Implementation of `git revert` (create new commit undoing changes) or `git reset` (move HEAD). For MVP, "System Restore" style revert (new commit with old state) is safest.

### 3. Visualization (Frontend)
- **Library**: `ReactFlow` (already used for Reality Graph).
- **Layout**: `dagre` for automatic DAG layout (top-to-bottom or left-to-right).
- **Nodes**: Commits (with message, timestamp, author).
- **Edges**: `parent_hash` -> `id` and `merge_parent_hash` -> `id`.
- **Interaction**:
  - Click Commit -> "Inspect Snapshot" / "Revert to Here".

## Execution Plan
1. **Backend**: Upgrade `Commit` model and `main.py` logic (Plan 3.1).
2. **Frontend**: Build `CommitGraph` component with `dagre` layout (Plan 3.2).
3. **Interaction**: Connect graph actions to `rollback_state` endpoint (Plan 3.3).
