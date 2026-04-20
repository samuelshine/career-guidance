# 🤖 AI Agents — CareerOps Multi-Agent System

> 7 specialized AI agents that collaborate to provide comprehensive career guidance.

All agents use **Google Gemini** models via **LangChain** with structured Pydantic output parsing. Each agent has a single responsibility and a carefully crafted system prompt.

---

## Agent Overview

```
                        ┌──────────────────┐
                        │   User Request   │
                        └────────┬─────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
            ┌───────▼──┐  ┌─────▼─────┐  ┌──▼────────┐
            │ Ingestor │  │ Branching │  │  Coach    │
            │ (Resume) │  │ (Diffing) │  │ (Advice)  │
            └──────────┘  └───────────┘  └───────────┘
                    │            │            │
            ┌───────▼──┐  ┌─────▼─────┐  ┌──▼────────┐
            │ Market   │  │Interviewer│  │ Recruiter │
            │ Analyst  │  │ (Mock Q&A)│  │ (Outreach)│
            └──────────┘  └───────────┘  └───────────┘
                                 │
                        ┌────────▼─────────┐
                        │ Hiring Committee │
                        │ (Multi-Persona)  │
                        └──────────────────┘
```

---

## 1. Resume Ingestor (`ingestor.py`)

**Model:** `gemini-2.5-flash-lite` · **Temperature:** 0 (deterministic)

### What It Does
Parses raw resume text (extracted from PDF via `pypdf`) and produces a structured profile with normalized skills.

### How It Works
1. **Extraction** — Identifies all explicit skills, education, and roles
2. **Contextualization** — Recognizes institution-specific entities (e.g., "CSA" → "Centre for Social Action")
3. **Normalization** — Standardizes skill names ("MS Excel 2013" → "Microsoft Excel")
4. **Categorization** — Groups skills into `Hard`, `Soft`, and `Domain` buckets
5. **Formatting** — Outputs a `ExtractedProfile` Pydantic model

### Output Schema
```python
class ExtractedProfile(BaseModel):
    full_name: str
    current_role: str          # Default: "Student"
    experience: List[str]      # All job titles found
    skills: List[Skill]        # name, category, proficiency (0.0–1.0)
```

### API Endpoint
- `POST /upload-resume` — Accepts a PDF file, returns updated `CareerState`

---

## 2. Branching Engine (`branching.py`)

**Model:** `gemini-2.5-flash-lite` · **Temperature:** 0.2

### What It Does
Performs **semantic skill diffing** — compares a user's profile against a target job description to identify gaps (conflicts) and generate actionable patch plans.

### Key Rules
- **Semantic Matching:** "scikit-learn" satisfies "Machine Learning" (low/no gap). "React" does NOT satisfy "Angular" (conflict).
- **Severity Classification:**
  - `CRITICAL` — Missing hard skills core to the role
  - `WARNING` — Missing soft skills or nice-to-haves
- **Patch Plans:** Every conflict includes specific resources (e.g., "Coursera: Deep Learning Specialization"), action items, and estimated hours.

### Output Schema
```python
class BranchingAnalysis(BaseModel):
    conflicts: List[Conflict]       # Skill gaps with patches
    feasibility_score: float        # 0.0 to 1.0 realism score
```

### Additional Feature: Branch Merging
The `merge_branches()` method performs a union of conflicts from two branches (deduplicated by `missing_skill`), enabling hybrid career paths.

### API Endpoint
- `POST /branch/create` — Provide `target_role` + `job_description`, returns a new `Branch` with conflicts

---

## 3. Career Coach (`coach.py`)

**Model:** `gemini-2.5-flash-lite` · **Temperature:** 0.7 (creative)

### What It Does
Provides persona-driven career advice via chat. The coach adapts its personality based on the target company/industry.

### Built-in Personas

| Company/Type | Persona | Tone |
|---|---|---|
| **Goldman Sachs** | Vice President | High-stakes, analytical, mentorship-oriented |
| **Deloitte** | Senior Consultant | Professional, compliance-focused, encouraging |
| **Startup** | YC Founder | Direct, casual, execution-focused |
| **Teach for India** | Fellowship Recruiter | Warm, empathetic, social-impact focused |
| **Generic** (fallback) | Senior Recruiter | Strict but helpful, actionable |

### How Persona Selection Works
The agent checks if the target company name matches any key in the persona dictionary (case-insensitive substring match). If no match is found, it falls back to the `Generic` persona.

### API Endpoint
- `POST /coach/chat` — Provide `branch_id`, `conflict_id`, and `message`, returns coaching response

---

## 4. Interview Agent (`interviewer.py`)

**Model:** `gemini-2.5-flash-lite` · **Temperature:** 0.7

### What It Does
Conducts **mock interviews** in two phases:
1. **Question Generation** — Produces role-specific interview questions with context tips
2. **Answer Evaluation** — Scores and critiques user responses, then provides an improved answer

### Company Tone Adaptation
| Company Type | Interview Focus |
|---|---|
| Google / Meta | Data-driven, scalable systems |
| Startups | Pragmatic, execution, fast-paced |
| Default | Professional and academic |

### Output Schemas
```python
class InterviewQuestion(BaseModel):
    question: str
    context: Optional[str]      # Tips for answering

class InterviewFeedback(BaseModel):
    score: int                  # 0–100
    feedback: str               # Constructive critique
    improved_answer: str        # Model answer example
```

### API Endpoints
- `POST /interview/start` — Provide `target_role`, `company_name`, `topic`, get a question back
- `POST /interview/submit` — Submit `question` + `answer`, get scored feedback

---

## 5. Recruiter Agent (`recruiter.py`)

**Model:** `gemini-2.5-flash-lite` · **Temperature:** 0.7

### What It Does
Evaluates a candidate's readiness for a target role and drafts a **headhunt-style message**. The tone and content vary based on a calculated readiness score.

### Scoring Logic
```
score = (acquired_skills / (acquired_skills + remaining_conflicts)) × 100
```

### Decision Thresholds

| Score | Decision | Message Style |
|---|---|---|
| > 80% | `HIRE` | Exciting headhunt invitation |
| 50–80% | `WAITLIST` | Encouraging "keep in touch" + specific gap advice |
| < 50% | `REJECT` | Polite rejection with constructive growth areas |

### API Endpoint
- `POST /recruiter/headhunt` — Provide `branch_id`, returns `{ score, message, decision }`

---

## 6. Market Analyst (`market_analyst.py`)

**Model:** `gemini-1.5-flash` · **Temperature:** 0.1 (factual)

### What It Does
Fetches **live market data** for a given role and analyzes it to produce salary ranges, demand levels, trends, and top skills.

### How It Works
1. **Web Search** — Queries DuckDuckGo for salary/demand data (e.g., `"Salary for AI Engineer 2025 Remote and job market demand trends"`)
2. **LLM Analysis** — Feeds search results to Gemini to extract structured insights
3. **Caching** — Results are cached in-memory for 24 hours to avoid rate limits

### Resilience
- If DuckDuckGo search fails → Uses LLM's built-in knowledge to fill gaps
- If the entire pipeline fails → Returns a safe fallback with `"Unavailable"` values

### Output Schema
```python
class MarketInsight(BaseModel):
    salary_range: str           # e.g., "$100k - $150k"
    demand_level: str           # "High", "Medium", or "Low"
    trends: List[str]           # 3–5 market trend bullets
    top_skills: List[str]       # 5 key skills in demand
    last_updated: datetime
```

### API Trigger
Automatically invoked when a new branch is created (`POST /branch/create`). The market insight is attached to the branch.

---

## 7. Hiring Committee (`hiring_committee.py`)

**Model:** `gemini-1.5-flash` · **Temperature:** 0.8 (creative debate)

### What It Does
Simulates a **3-member hiring panel** that debates a candidate's profile and delivers a final verdict. This is the most sophisticated agent — it generates a multi-turn debate transcript.

### Committee Members

| Member | Role | Behavior |
|---|---|---|
| **Technical Recruiter** | Assesses hard skills | Must object if CRITICAL conflicts remain |
| **HR Manager** | Assesses cultural fit | Focuses on potential and growth trajectory |
| **Hiring Manager** | Final decision | Weighs team input + market reality |

### Input Context
The committee receives:
- Candidate skills with proficiency scores
- Outstanding conflicts (skill gaps) with severity
- Market reality (salary range, demand level)
- Past experience

### Output Schema
```python
class HiringReport(BaseModel):
    debate_log: List[DebateMessage]   # Sequential discussion transcript
    final_decision: bool              # True = HIRED
    salary_offer: Optional[str]       # Offered range if hired
    feedback: str                     # Summary feedback for candidate
```

### API Endpoint
- `POST /recruiter/headhunt` — Convenes the committee for the active branch

---

## Adding a New Agent

To add a new agent to the system:

1. Create a new file in `agents/` (e.g., `agents/my_agent.py`)
2. Define a system prompt with clear rules
3. Create a Pydantic output model for structured responses
4. Build a LangChain chain: `prompt | llm | parser`
5. Import and instantiate the agent in `main.py`
6. Create an API endpoint that calls the agent

### Template

```python
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

class MyOutput(BaseModel):
    result: str = Field(description="The agent's output")

MY_SYSTEM_PROMPT = """You are a specialized agent that..."""

class MyAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0.2)
        self.parser = PydanticOutputParser(pydantic_object=MyOutput)
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", MY_SYSTEM_PROMPT),
            ("human", "{input}\n\n{format_instructions}")
        ])
        self.chain = self.prompt | self.llm | self.parser

    def run(self, input_text: str) -> MyOutput:
        return self.chain.invoke({
            "input": input_text,
            "format_instructions": self.parser.get_format_instructions()
        })
```
