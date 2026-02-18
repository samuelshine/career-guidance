# Plan 3.3: Interactive Git Actions

## Objective
Enable interactive actions on the Git Graph, allowing users to select commits and perform operations like Revert or Merge, moving beyond static visualization.

## Context
- `CommitGraph.tsx` (Plan 3.2) displays the graph.
- Backend `rollback_state` (Plan 3.1) supports reverting.

## Tasks
1. [MODIFY] `frontend/src/components/graph/CommitGraph.tsx`:
   - Add click handler for nodes to select a commit.
   - Highlight selected node visually.

2. [MODIFY] `frontend/src/pages/Dashboard.tsx`:
   - Display details of the selected commit (message, author, changes).
   - Add `Revert` button that triggers `api.rollbackState(selectedCommit.id)`.
   - Add confirmation dialog ("This will discard all changes after this commit...").

3. [VERIFY]
   - Manual Test: Commit A -> Commit B -> Select A -> Revert -> Confirm state rollback.
