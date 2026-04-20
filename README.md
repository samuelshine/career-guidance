# 🚀 CareerOps — AI-Powered Career Guidance Platform

> **Think of your career as a Git repository.** Branch into new roles, diff your skills against job requirements, resolve conflicts with AI coaching, and merge your way to your dream career.

CareerOps is a multi-agent AI system that reimagines career planning through the metaphor of **version control**. Upload your resume, explore career "branches," identify skill gaps ("conflicts"), get personalized coaching, practice mock interviews, and receive recruiter-style evaluations — all powered by a collaborative team of specialized AI agents.

---

## 🎯 Core Concept

| Git Metaphor | Career Equivalent |
|---|---|
| **Branch** | A potential career path (e.g., "Pivot to AI Engineer") |
| **Conflict** | A skill gap between your profile and the target role |
| **Patch** | A learning plan to close a specific skill gap |
| **Merge** | Combining skills from two career paths into a hybrid role |
| **Commit** | A snapshot of your career state at a point in time |
| **Rollback** | Reverting to a previous career state |

---

## ✨ Key Features

- **📄 Resume Ingestion** — Upload a PDF resume. An AI agent extracts and normalizes your skills, roles, and experience.
- **🌿 Career Branching** — Create new career "branches" by specifying a target role + job description. The AI performs a semantic diff against your profile.
- **⚠️ Conflict Detection** — Each branch highlights skill gaps classified as `CRITICAL` or `WARNING`, with actionable patch plans.
- **🔀 Branch Merging** — Merge two career paths to explore hybrid roles (e.g., "AI + Product Manager").
- **💬 AI Career Coach** — Chat with a persona-driven coach that adapts to specific company cultures (Goldman Sachs, Deloitte, Startups, etc.).
- **🎤 Mock Interviews** — Practice role-specific interviews with AI-generated questions and scored feedback.
- **📊 Market Analysis** — Live market data (salary ranges, demand levels, trends) fetched via DuckDuckGo search and analyzed by an LLM.
- **👥 Hiring Committee Simulation** — A 3-member AI panel (Technical Recruiter, HR Manager, Hiring Manager) debates your candidacy and delivers a verdict.
- **🔐 Authentication** — JWT-based user registration and login with bcrypt password hashing.
- **⏪ Version History & Rollback** — Full commit history with the ability to roll back to any previous state.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                       │
│         (Vite + TypeScript + Tailwind + shadcn/ui)       │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌─────────────┐ │
│  │Dashboard │ │ Coach    │ │Interview│ │Branch       │ │
│  │  Page    │ │  Page    │ │  Page   │ │ Explorer    │ │
│  └────┬─────┘ └────┬─────┘ └────┬────┘ └──────┬──────┘ │
│       │             │            │              │        │
│       └─────────────┴────────────┴──────────────┘        │
│                         │ HTTP/REST                      │
└─────────────────────────┼────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────┐
│                   FastAPI Backend                         │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                 API Layer (main.py)                 │  │
│  │  /upload-resume  /branch/create  /coach/chat       │  │
│  │  /interview/*    /recruiter/headhunt  /conflict/*  │  │
│  └────────────┬───────────────────────────────────────┘  │
│               │                                          │
│  ┌────────────┴───────────────────────────────────────┐  │
│  │              AI Agent Layer (7 Agents)              │  │
│  │                                                     │  │
│  │  🔍 Ingestor    🌿 Branching    💬 Coach           │  │
│  │  🎤 Interviewer 📊 Market       🤝 Recruiter      │  │
│  │  👥 Hiring Committee                                │  │
│  └────────────┬───────────────────────────────────────┘  │
│               │                                          │
│  ┌────────────┴──────┐  ┌────────────────────────────┐  │
│  │  Google Gemini API │  │  DuckDuckGo Search API    │  │
│  │  (LangChain)       │  │  (Market Data)            │  │
│  └───────────────────┘  └────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │         JSON File Database (data/users/)           │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Agents

The system is powered by **7 specialized AI agents**, each with a focused responsibility. All agents use Google Gemini models via LangChain.

| Agent | File | Model | Purpose |
|---|---|---|---|
| **Resume Ingestor** | `agents/ingestor.py` | `gemini-2.5-flash-lite` | Parses PDF resumes, extracts and normalizes skills |
| **Branching Engine** | `agents/branching.py` | `gemini-2.5-flash-lite` | Performs semantic skill diffing against target roles |
| **Career Coach** | `agents/coach.py` | `gemini-2.5-flash-lite` | Persona-driven career advice (company-specific) |
| **Interview Agent** | `agents/interviewer.py` | `gemini-2.5-flash-lite` | Generates questions and scores mock interview answers |
| **Recruiter Agent** | `agents/recruiter.py` | `gemini-2.5-flash-lite` | Evaluates readiness and drafts outreach messages |
| **Market Analyst** | `agents/market_analyst.py` | `gemini-1.5-flash` | Fetches live market data and analyzes salary/trends |
| **Hiring Committee** | `agents/hiring_committee.py` | `gemini-1.5-flash` | Simulates a 3-person hiring panel debate |

> See [`backend/agents/README.md`](backend/agents/README.md) for a deep dive into each agent.

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.10+** | Runtime |
| **FastAPI** | REST API framework |
| **LangChain** | LLM orchestration and prompt management |
| **Google Gemini** | LLM provider (via `langchain-google-genai`) |
| **DuckDuckGo Search** | Live market data fetching |
| **Pydantic** | Data validation and serialization |
| **python-jose + bcrypt** | JWT authentication |
| **pypdf** | PDF resume text extraction |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui + Radix** | Accessible UI component primitives |
| **React Flow** | Interactive career branch graph visualization |
| **Framer Motion** | Animations and transitions |
| **React Router v7** | Client-side routing |
| **Lucide React** | Icon library |

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm
- **Google API Key** — Obtain from [Google AI Studio](https://aistudio.google.com/apikey)

### Quick Start (One Command)

```bash
# Clone the repository
git clone https://github.com/your-username/career-guidance.git
cd career-guidance

# Create your environment file
cp backend/.env.example backend/.env
# Edit backend/.env and add your GOOGLE_API_KEY

# Run the start script (sets up both backend and frontend)
chmod +x start.sh
./start.sh
```

This will:
1. Create a Python virtual environment and install dependencies
2. Start the FastAPI backend on `http://localhost:8000`
3. Install Node.js dependencies and start the React frontend on `http://localhost:5173`

### Manual Setup

#### Backend
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your GOOGLE_API_KEY

# Seed demo data (optional)
python seed_data.py

# Start the server
uvicorn main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Demo Credentials

After running `python seed_data.py`, you can log in with:
- **Username:** `demo`
- **Password:** `demo123`

---

## 📁 Project Structure

```
career-guidance/
├── backend/                  # FastAPI backend application
│   ├── agents/               # 7 specialized AI agents
│   ├── tests/                # Unit and E2E tests
│   ├── data/                 # JSON file database (user data)
│   ├── main.py               # API routes and application entry point
│   ├── models.py             # Pydantic data models
│   ├── database.py           # JSON file-based database layer
│   ├── auth.py               # JWT authentication utilities
│   ├── seed_data.py          # Demo data seeder
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variable template
│
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/            # Route-level page components
│   │   ├── components/       # Reusable UI and feature components
│   │   ├── lib/              # Utility functions
│   │   └── App.tsx           # Root component with routing
│   ├── package.json          # Node.js dependencies
│   └── tailwind.config.js    # Tailwind CSS configuration
│
├── adapters/                 # Optional LLM-specific guidance
│   ├── CLAUDE.md             # Claude model tips
│   ├── GEMINI.md             # Gemini model tips
│   └── GPT_OSS.md           # GPT / Open-source model tips
│
├── docs/                     # Operational documentation
│   ├── runbook.md            # Debugging and recovery procedures
│   ├── model-selection-playbook.md
│   └── token-optimization-guide.md
│
├── scripts/                  # Utility scripts (search, validation)
├── start.sh                  # One-command startup script
├── model_capabilities.yaml   # Model capability registry
└── PROJECT_RULES.md          # Development methodology rules (GSD)
```

---

## 🔗 API Reference

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/register` | Register a new user | ❌ |
| `POST` | `/token` | Login and get JWT token | ❌ |
| `GET` | `/state` | Get current career state | ✅ |
| `POST` | `/upload-resume` | Upload and parse a PDF resume | ✅ |
| `POST` | `/branch/create` | Create a new career branch | ✅ |
| `POST` | `/branch/merge` | Merge two branches | ✅ |
| `POST` | `/coach/chat` | Chat with AI career coach | ✅ |
| `POST` | `/conflict/resolve` | Mark a conflict as resolved | ✅ |
| `POST` | `/recruiter/headhunt` | Get recruiter evaluation | ✅ |
| `POST` | `/interview/start` | Generate interview question | ✅ |
| `POST` | `/interview/submit` | Submit answer for evaluation | ✅ |
| `POST` | `/state/rollback` | Rollback to a previous commit | ✅ |
| `POST` | `/reset` | Reset to demo seed data | ❌ |

> Interactive API docs available at `http://localhost:8000/docs` (Swagger UI).

---

## 🧪 Testing

```bash
cd backend

# Activate virtual environment
source venv/bin/activate

# Run all tests
pytest -v

# Run specific test suites
pytest tests/test_auth_flow.py -v      # Authentication tests
pytest tests/test_git_logic.py -v      # Version control logic tests
pytest tests/test_hiring_committee.py -v  # Hiring committee tests
pytest tests/e2e/test_full_flow.py -v  # End-to-end flow tests
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_API_KEY` | ✅ | Google AI Studio API key for Gemini models |
| `JWT_SECRET_KEY` | ✅ | Secret key for JWT token signing |
| `LANGCHAIN_TRACING_V2` | ❌ | Enable LangSmith tracing (`true`/`false`) |
| `LANGCHAIN_API_KEY` | ❌ | LangSmith API key for observability |
| `LANGCHAIN_PROJECT` | ❌ | LangSmith project name |

---

## 📄 License

This project was built as a hackathon prototype. See individual files for any license information.

---

<p align="center">
  Built with ❤️ using Google Gemini, LangChain, FastAPI, and React
</p>
