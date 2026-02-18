# Plan 5.1: Error Handling & UI Polish

## Objective
Enhance the user experience by providing clear feedback on errors and improving visual stability.

## Tasks
1. [NEW] `frontend/src/components/ui/toaster.tsx`:
   - Add shadcn/ui typical `Toaster` component.
   - Use `sonner` or `react-hot-toast` if preferred, or standard `Toast` primitives.
   - Let's use simple `sonner` or built-in `use-toast` hook pattern if available in components/ui.

2. [MODIFY] `frontend/src/pages/Dashboard.tsx`:
   - Wrap API calls in try-catch blocks.
   - Display `toast.error()` on failures (e.g. Branch Creation, Merge, Rollback).
   - Display `toast.success()` on lengthy operations completion.

3. [VERIFY] Manual check: Force a network error (disconnect) and verify toast appears.
