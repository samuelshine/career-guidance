# Adapters — LLM-Specific Guidance

> **Everything in this directory is optional.** For canonical rules, see [`PROJECT_RULES.md`](../PROJECT_RULES.md).

---

## Purpose

Adapters provide **optional, model-specific tips and enhancements** for working with different LLM providers. They do NOT contain rules — they contain guidance for getting the best results from each model family.

CareerOps is **model-agnostic by design**. No workflow, agent, or feature depends on a specific model. Adapters exist purely for optimization.

---

## Available Adapters

| File | Model Family | Key Guidance |
|---|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Anthropic Claude | Extended thinking mode, effort levels, artifacts |
| [`GEMINI.md`](GEMINI.md) | Google Gemini | Flash vs Pro selection, large context optimization, grounding |
| [`GPT_OSS.md`](GPT_OSS.md) | OpenAI GPT & Open-Source | Function calling, shorter context strategies, local deployment |

---

## Rules for Adapters

1. **Must begin with:** _"Everything in this file is optional. For canonical rules, see PROJECT_RULES.md."_
2. **No hard dependencies** — Nothing breaks if an adapter is removed
3. **No rule duplication** — Canonical rules live only in `PROJECT_RULES.md`
4. **Capability-based** — Recommend by capability ("use a reasoning model"), not by name

---

## When to Reference

- Switching between LLM providers for the AI agents
- Optimizing prompt engineering for a specific model
- Configuring context window strategies
- Setting up model-specific IDE integrations
