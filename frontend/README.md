# Frontend — CareerOps UI

> React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui

---

## Overview

A modern single-page application that provides the user interface for CareerOps. It communicates with the FastAPI backend via REST and renders interactive career branch visualizations, AI chat interfaces, and mock interview sessions.

---

## Pages

| Page | Route | File | Description |
|---|---|---|---|
| **Login** | `/login` | `pages/LoginPage.tsx` | JWT authentication login form |
| **Register** | `/register` | `pages/RegisterPage.tsx` | New user registration |
| **Dashboard** | `/` | `pages/Dashboard.tsx` | Main hub — profile summary, active branch, conflicts, commit history |
| **Branch Explorer** | `/branches` | `pages/BranchExplorerPage.tsx` | Interactive graph visualization of all career branches |
| **Career Coach** | `/coach` | `pages/CoachPage.tsx` | AI-powered career coaching chat interface |
| **Mock Interview** | `/interview` | `pages/InterviewPage.tsx` | Mock interview practice with scored feedback |

All authenticated routes are wrapped in a `ProtectedRoute` component that redirects to `/login` if no JWT token is found in `localStorage`.

---

## Components

### Feature Components

| Component | File | Description |
|---|---|---|
| **ConflictSheet** | `components/ConflictSheet.tsx` | Slide-out panel showing skill gap details and patch plans |
| **ResumeUploadDialog** | `components/ResumeUploadDialog.tsx` | Modal dialog for PDF resume upload |
| **MergeBranchDialog** | `components/MergeBranchDialog.tsx` | Modal for selecting and merging two career branches |
| **RecruiterDialog** | `components/RecruiterDialog.tsx` | Displays recruiter evaluation results |
| **CommitHistory** | `components/CommitHistory.tsx` | Timeline view of career state commits |

### Graph Components

| Component | File | Description |
|---|---|---|
| **RealityGraph** | `components/graph/RealityGraph.tsx` | Interactive React Flow graph showing career branches and their relationships |
| **CommitGraph** | `components/graph/CommitGraph.tsx` | Git-style DAG visualization of commit history |

### Layout

| Component | File | Description |
|---|---|---|
| **AppLayout** | `components/layout/AppLayout.tsx` | App shell with sidebar navigation, header, and content area |

### UI Primitives (shadcn/ui)

All base UI components live in `components/ui/` and are built on **Radix UI** primitives:

`badge` · `button` · `card` · `dialog` · `input` · `label` · `progress` · `select` · `sheet` · `sonner` · `textarea`

---

## Key Libraries

| Library | Usage |
|---|---|
| **React Flow** (`reactflow`) | Interactive node-based graph for career branch visualization |
| **Dagre** | Graph layout algorithm for automatic node positioning |
| **Framer Motion** | Page transitions, micro-animations, and UI motion |
| **React Markdown** | Rendering LLM responses with markdown formatting |
| **Sonner** | Toast notification system |
| **date-fns** | Date formatting utilities |
| **Lucide React** | SVG icon library |
| **Canvas Confetti** | Celebration animation on achievements |

---

## Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → Opens on http://localhost:5173

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

The dev server proxies API requests to `http://localhost:8000` (the FastAPI backend).

---

## Project Structure

```
src/
├── App.tsx              # Root component with React Router setup
├── main.tsx             # Entry point (renders App into DOM)
├── index.css            # Global styles and Tailwind imports
├── App.css              # App-level styles
│
├── pages/               # Page-level components (one per route)
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── Dashboard.tsx
│   ├── BranchExplorerPage.tsx
│   ├── CoachPage.tsx
│   ├── InterviewPage.tsx
│   └── ComingSoon.tsx
│
├── components/
│   ├── ConflictSheet.tsx
│   ├── ResumeUploadDialog.tsx
│   ├── MergeBranchDialog.tsx
│   ├── RecruiterDialog.tsx
│   ├── CommitHistory.tsx
│   │
│   ├── graph/
│   │   ├── RealityGraph.tsx   # Career branch visualization
│   │   └── CommitGraph.tsx    # Git-style commit DAG
│   │
│   ├── layout/
│   │   └── AppLayout.tsx      # App shell with navigation
│   │
│   └── ui/                    # shadcn/ui base components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── progress.tsx
│       ├── select.tsx
│       ├── sheet.tsx
│       ├── sonner.tsx
│       └── textarea.tsx
│
├── lib/                 # Utility functions
└── assets/              # Static assets
```

---

## Configuration Files

| File | Purpose |
|---|---|
| `vite.config.ts` | Vite bundler configuration |
| `tailwind.config.js` | Tailwind CSS theme customization |
| `tsconfig.json` | TypeScript compiler configuration |
| `postcss.config.js` | PostCSS plugin setup (autoprefixer) |
| `components.json` | shadcn/ui component configuration |
| `eslint.config.js` | ESLint linting rules |
