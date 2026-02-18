---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Implement Market Analyst Agent

## Objective
Create the `MarketAnalyst` agent powered by DuckDuckGo search to fetch live job market data (salary, demand, trends). Update the data model to store this insight.

## Context
- .gsd/phases/2/RESEARCH.md
- backend/models.py
- backend/requirements.txt
- New: backend/agents/market_analyst.py

## Tasks

<task type="auto">
  <name>Add Search Dependencies</name>
  <files>
    backend/requirements.txt
    backend/start.sh
  </files>
  <action>
    - Add `langchain-community` and `duckduckgo-search` to `backend/requirements.txt`.
    - Install dependencies in `backend/venv` (via `start.sh` or manual pip install).
  </action>
  <verify>
    grep "duckduckgo-search" backend/requirements.txt
  </verify>
  <done>
    Dependencies added.
  </done>
</task>

<task type="auto">
  <name>Define Market Insight Models</name>
  <files>
    backend/models.py
  </files>
  <action>
    - Add `MarketInsight` model to `models.py`:
      - `salary_range`: str (e.g. "$120k - $160k")
      - `demand_level`: str (High/Medium/Low)
      - `trends`: List[str]
      - `top_skills`: List[str]
      - `last_updated`: datetime
    - Update `Branch` model to include optional `market_insight: MarketInsight`.
  </action>
  <verify>
    python3 -c "from backend.models import MarketInsight; print(MarketInsight.__fields__.keys())"
  </verify>
  <done>
    Pydantic models updated to support market data.
  </done>
</task>

<task type="auto">
  <name>Create Market Analyst Agent</name>
  <files>
    backend/agents/market_analyst.py
  </files>
  <action>
    - Create `MarketAnalyst` class.
    - Initialize `DuckDuckGoSearchRun` tool.
    - Implement `analyze_role(role: str, location: str = "Remote") -> MarketInsight`.
    - Use Gemini to parse search results into structured JSON matching `MarketInsight`.
    - Implementation detail: Search query should be "Salary for {role} 2025" and "Job market demand for {role} 2025".
  </action>
  <verify>
    ls backend/agents/market_analyst.py
  </verify>
  <done>
    Agent class exists and can be imported.
  </done>
</task>

## Success Criteria
- [ ] Requirements installed.
- [ ] `MarketInsight` model exists.
- [ ] `MarketAnalyst.analyze_role("Python Developer")` returns structured data (even if mocked or real).
