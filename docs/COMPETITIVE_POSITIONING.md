# Competitive Positioning

## The Core Argument

Acuity demonstrates that Exa's Deep Research API produces investment-grade, structured, cited research in under 90 seconds — research that would take an analyst 3-4 hours manually. The quality difference versus Tavily (the most common developer alternative) is made visible through the direct comparison.

---

## Exa vs. Tavily: Why Exa Wins

### 1. Index Quality
Exa built its own search index from scratch (500B+ URLs) specifically optimized for AI consumption. The index filters spam, SEO-optimized content, and low-quality pages before any content reaches a developer's application. Tavily (now owned by Nebius, a cloud company) uses a less specialized index that was not purpose-built with AI quality requirements in mind.

**What this means visually in Acuity:** Exa finds recent, authoritative sources (WSJ, Bloomberg, financial filings, quality trade press). Tavily returns a mix including SEO-optimized blog posts and low-authority pages that pollute the research output.

### 2. Neural vs. Keyword Search
Exa's search is fundamentally semantic/neural — it finds pages by meaning, not just keyword matching. When an investment analyst asks "what are the competitive threats to Stripe in the last 90 days?", Exa finds the most semantically relevant analytical content. Tavily uses more keyword-oriented search that returns pages containing those words regardless of analytical quality.

**What this means visually in Acuity:** The Exa output for the competitive landscape section will contain specific, analytically relevant observations. Tavily returns a list of pages that mention Stripe and competitors without the semantic relevance filtering.

### 3. Structured Output by Design
Exa's Deep Research API accepts an `outputSchema` and returns structured JSON matching exactly the format the developer defines. The six sections in Acuity are the output of a single API call with a schema defining those six fields. The output is consistently structured, parseable, and ready to display.

Tavily returns a list of search result objects (title, URL, snippet). There is no synthesis, no structured output, no section framework. The developer would need to do their own synthesis on top.

**What this means visually in Acuity:** Exa's output appears as six clean, readable sections with coherent analysis. Tavily's output appears as a list of search result snippets with URLs — raw material, not finished research.

### 4. Speed
Exa Deep Research: 30–90 seconds for six synthesized, cited sections. This is because Exa's research engine runs internally — it searches, reads, and synthesizes without requiring external LLM calls from the developer. The developer pays only for Exa usage.

For comparison: OpenAI Deep Research (o3/o4) takes 3–15 minutes and requires LLM inference costs on top of search costs. Claude extended research takes 2–8 minutes. For a demo or for a product where users expect near-real-time results, Exa's speed is a meaningful product advantage.

**What this means visually in Acuity:** All six sections load within 90 seconds. This is fast enough to feel live and impressive in a demo context.

### 5. Cost at Scale
Exa Deep Research: approximately $12–15 per 1,000 requests. Generating 100 company research briefs costs roughly $1.50 in Exa API costs.

OpenAI Deep Research via o3: $10–40+ per research task. Running 100 research briefs would cost $1,000–4,000+.

For companies like Grasp or DiligenceSquared generating thousands of research briefs for their customers, the economics of Exa vs. LLM deep research are dramatically different.

**What this means for the sales conversation:** A company like Grasp can offer their customers unlimited research briefs at a sustainable unit economics because they're using Exa at $0.015/brief rather than $10-40/brief via OpenAI.

### 6. Developer Independence
Exa is model-agnostic. You call Exa for search and retrieval, then synthesize with whatever LLM you want — Claude, GPT-4o, Gemini, or Exa's own built-in synthesis. OpenAI's Deep Research locks you to OpenAI's model stack. Exa gives developers control over the synthesis layer.

---

## How to Make These Arguments Visible in the UI

These arguments should be embedded in the Acuity interface, not stated as explicit claims. Show, don't tell.

### Citation Quality Display
Every citation chip shows the publication name and date:
```
[Wall Street Journal — May 15, 2026] ↗
[Bloomberg — April 28, 2026] ↗
[S&P Global — March 10, 2026] ↗
```
Authoritative sources, recent dates. This is the index quality argument made visual without words.

### Section Count and Structure
"6 sections · 8 sources · Completed in 47 seconds" — a subtle stats line below the company header. Makes the speed and comprehensiveness concrete.

### Comparison Header
In the Tavily comparison panel, a subtle header:
```
Exa Deep Research                    Tavily Search
Structured synthesis · Cited sources  Raw results · No synthesis
```
This frames the comparison without being aggressive or claiming superiority explicitly.

### The "Powered by Exa" Attribution
Small footer: "Research powered by Exa's Neural Search API · exa.ai". Keeps the attribution visible without making it the center of the experience.

---

## What Acuity Explicitly Does NOT Claim

- Acuity is not a replacement for a data room, CIM, or private financial data
- Acuity works on publicly available web content only — appropriate framing is "the public intelligence layer"
- Exa does not produce information that doesn't exist in public sources

These limitations are features, not bugs. Acuity shows what Exa powers: the public web intelligence layer before an analyst enters private data. That layer has always existed; Exa makes it fast, structured, and programmatically accessible.
