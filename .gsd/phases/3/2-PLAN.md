# Plan 3.2: Frontend Commit Graph

## Objective
Visualize the enhanced commit history as an interactive graph using ReactFlow and Dagre layout, replacing the simple timeline view.

## Context
- `frontend/src/components/CommitHistory.tsx` currently shows a linear list.
- `RealityGraph.tsx` already uses `ReactFlow`.

## Tasks
1. [NEW] `frontend/src/components/graph/CommitGraph.tsx`:
   - Create interactive graph component.
   - Use `dagre` (or custom layout) to visualize branching and merging.
   - Nodes: Commits (showing message, author, timestamp).
   - Edges: Directed arrows from parent to child (HEAD at top/right).

2. [MODIFY] `frontend/src/pages/Dashboard.tsx`:
   - Ensure `CommitGraph` is displayed, possibly replacing or augmenting `CommitHistory`.
   - Consider a "History" tab or toggle.

3. [VERIFY] Manual check: Create branches, merge, and ensure graph updates visually.
