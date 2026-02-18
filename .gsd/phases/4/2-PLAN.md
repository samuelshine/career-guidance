# Plan 4.2: Frontend Hiring Committee UI

## Objective
Visualize the multi-agent debate in the frontend `RecruiterDialog`.

## Tasks
1. [MODIFY] `frontend/src/lib/api.ts`:
   - Update `HiringReport` type to match backend.
   - Example:
     ```typescript
     export interface HiringReport {
         debate_log: { persona: string, message: string }[];
         final_decision: boolean;
         salary_offer: string;
         feedback: string;
     }
     ```

2. [MODIFY] `frontend/src/components/RecruiterDialog.tsx`:
   - Show loading state as "Committee is deliberating..."
   - Render `debate_log` sequentially (optional typing effect).
   - Display personas with avatars/icons (Technical, HR, Manager).
   - Show final verdict clearly (Green "HIRED" vs Red "REJECTED").

3. [VERIFY] Manual check: Run `Check Hiring Status` and see the debate unfold.
