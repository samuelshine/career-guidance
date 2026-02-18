# Plan 3.1: Backend Git Logic Upgrade

## Objective
Upgrade the backend data model and logic to support a true Git-like Directed Acyclic Graph (DAG) for commits, enabling proper branching and merging visualization.

## Context
- `backend/models.py` currently has a linear `Commit` model.
- `backend/main.py` appends to a flat list.

## Tasks
1. [MODIFY] `backend/models.py`:
   - Update `Commit` class to include `branch_id: str` and `merge_parent_hash: Optional[str]`.
   - Ensure backward compatibility (optional fields).

2. [MODIFY] `backend/main.py`:
   - Update `create_branch`: Set `branch_id` to new branch ID, `parent_hash` to currents HEAD.
   - Update `merge_branches_endpoint`: Set `branch_id` to new branch, `parent_hash` to Branch A HEAD, `merge_parent_hash` to Branch B HEAD.
   - Update `resolve_conflict`: Set `branch_id` to active branch, `parent_hash` to active branch HEAD.
   - Update `rollback_state`: Create revert commit on active branch.

3. [NEW] `backend/tests/test_git_logic.py`:
   - Test creating a branch, merging, and verifying the commit structure forms a DAG.
