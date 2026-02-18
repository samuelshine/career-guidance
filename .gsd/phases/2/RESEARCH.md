# Research: Search Tools for Market Analyst

**Goal**: Enable the Market Analyst Agent to search for live job market data (salaries, trends, skill demand) without complex setup or high costs.

## Options Evaluated

### 1. DuckDuckGo Search
- **Library**: `langchain_community.tools.DuckDuckGoSearchRun`
- **Cost**: Free.
- **Requirements**: No API key.
- **Pros**: Zero friction, reliable snippets.
- **Cons**: Limited to snippets (might miss deep salary table data), rate limits if abused.

### 2. Tavily Search
- **Library**: `langchain_tavily.TavilySearchResults`
- **Cost**: Freemium (1000 req/month).
- **Requirements**: API Key.
- **Pros**: Optimized for LLMs, returns parsed content (not just snippets), less noise.
- **Cons**: Adds dependency on another service/key.

### 3. Google Gemini Native Grounding
- **Library**: `langchain_google_genai.ChatGoogleGenerativeAI`
- **Cost**: Part of Gemini API usage.
- **Requirements**: `google-generativeai` library.
- **Pros**: Built-in, high quality.
- **Cons**: API surface area in LangChain is newer/experimental, might standardise on Google's search result format which differs from generic tools.

## Decision: DuckDuckGo (MVP)
For the MVP and "Foundation" phase, we will use **DuckDuckGo**.
- It requires no configuration from the user.
- It provides sufficient "Live Reality" signals (e.g., "React developer salary 2026", "Is Ruby dead?").
- We can upgrade to Tavily later if quality is insufficient.

## Implementation Details
1. Add `langchain-community` and `duckduckgo-search` to `requirements.txt`.
2. Create `MarketAnalyst` agent using `DuckDuckGoSearchRun` tool.
3. Prompt engineering: "Search for 'X salary 2026' and 'X job market outlook'".
