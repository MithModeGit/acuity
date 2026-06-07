# Exa vs. Tavily — Evidence Dossier (Stripe, Investment-Banking Research)

> **Status:** Phase 1 analysis for review. No app code changed, nothing deployed.
> **Purpose:** Decide, from *actual* outputs (not assumptions), how Exa and Tavily
> really compare across the five dimensions that matter to a research buyer, so the
> demo's comparison section is honest, specific, and defensible to an Exa co-founder.

---

## 0. Bottom line up front (read this first)

The original demo claim — *"Tavily returns raw results, no synthesis, no structured
output"* — is **false** and must be removed. Tavily ran the identical six-section
investment-banking brief on Stripe, returned **validated structured JSON** (same
`output_schema` mechanism as Exa), with specific competitors, named transactions,
and figures. On *content*, this is much closer than the strawman implied.

**The honest verdict from this head-to-head:** Exa **edges** Tavily on **source
authority**, **synthesis polish**, and **speed**, and is at **genuine parity** on
**accuracy** and **raw comprehensiveness**. It is a *modest, real, evidence-backed
edge* — not a blowout.

| Dimension | Exa | Tavily | Verdict |
|---|---|---|---|
| Source fidelity & authority | ●●●●○ | ●●●○○ | **Exa edge** — more institutional/finance-grade sources, broader set |
| Comprehensiveness | ●●●●○ | ●●●●○ | **Parity** — different strengths (Exa broader sourcing; Tavily denser financials) |
| Synthesis & structure | ●●●●○ | ●●●○○ | **Exa edge** — analyst narrative vs. hedged "the findings show…" compilation |
| Accuracy & grounding | ●●●●● | ●●●●● | **Parity** — both accurate on every checked claim; both need verification |
| Latency | ●●●●○ | ●●●○○ | **Exa edge** — 186s vs 338s on this task (1 run each) |

**Important caveat for your conviction *and* the demo:** a single IB-research query
does **not** exercise Exa's biggest structural moats — its specialized **company /
people / code / research-paper** indexes and semantic *find-similar* retrieval.
Those are where Exa is hardest to match, and this test doesn't touch them. So this
comparison, if anything, *understates* Exa's differentiation. More on that in §7–8.

---

## 1. Methodology (how this was kept fair)

- **Identical inputs.** Both engines received the *exact same* instruction string
  (the investment-banking analyst framing from `lib/exa.ts`) and the *same*
  six-section schema (`company_overview, competitive_landscape, industry_macro,
  moat_defensibility, investment_landscape, key_questions`, same field descriptions).
- **Standard tier vs standard tier.** Exa = the reused production seed
  (`exa-research`, the balanced default). Tavily = `research` with `model: "auto"`
  (its default). Neither side's strongest (`-pro`) tier was used. Apples to apples.
- **Single run, no best-of-N.** Tavily was called **once**; whatever it returned is
  what's analyzed. (The Exa side is the *same* output the demo already shows.)
- **Input parity is documented, not hidden.** The one unavoidable API difference:
  Exa folds the analyst persona into `instructions`; Tavily takes it as `input`.
  Same text, different field name.
- **Accuracy was checked, not asserted.** Specific claims from *both* outputs were
  verified against primary reporting (see §6).

Raw artifacts (uncommitted working files): `data/_tavily_stripe_raw.json` (full
Tavily output + sources), Exa side = `data/stripe_seed.json`.

---

## 2. The two runs at a glance

| | Exa (`exa-research`) | Tavily (`research: auto`) |
|---|---|---|
| Completed | yes | yes |
| Latency | **186 s** | **338 s** (`response_time` 337.48s) |
| Structured output | yes (6/6 sections) | yes (6/6 sections, schema validated) |
| Distinct sources returned | **43** | **15** |
| Citation metadata | url (+ dates/excerpts/scores at API level) | title + url + favicon only |

Two facts are unambiguous and in Exa's favor: it was **~1.8× faster** and returned
**~3× more sources**. Whether more sources = better is examined below.

---

## 3. Source fidelity & authority — **Exa edge (4 vs 3)**

**What the evidence shows.** Classifying every cited source by authority tier:

**Exa's set (43)** leans noticeably more *institutional / finance-grade*, which is
exactly what an investment banker trusts:
- **Tier 1 institutional:** Houlihan Lokey *FinTech Market Update Q1 2026* (PDF),
  McKinsey (*Financial services M&A*), PwC (*M&A trends*), the **Federal Reserve**
  (pay-by-bank note), J.P. Morgan (payments outlook), Forrester (Sessions 2026
  analysis), Finro (fintech multiples).
- **Quality press / primary:** CNBC (the $159B story), Stripe newsroom/blog/sessions.
- **Aggregators / analyst:** Tracxn, Sourcery, CorpDev, *Business of Payments*.
- **Weaker (present, honestly):** Chargeflow blog, FourWeekMBA, Built In.

**Tavily's set (15)** leans more on *company-primary + data aggregators + a few
SEO blogs*:
- **Excellent primary:** the **actual Stripe 2025 annual-letter PDF**
  (`assets.stripeassets.com/...Stripe-annual-letter-2025.pdf`), Stripe newsroom/blog.
  This is genuinely strong grounding.
- **Reputable analyst/data:** Javelin Strategy, MBI Deep Dives, Sacra, Contrary Research, Tracxn.
- **Low-authority / SEO:** PayCompass ("Stripe Stats"), ByteBridge (Medium),
  `market.us` (an SEO market-size report). *(Tavily also, amusingly, cited Exa's own
  `exa.ai/websets` directory.)*

**Honest read.** Exa's advantage here is **real but moderate**. For *investment*
research specifically, Exa pulled bulge-bracket / consultancy / central-bank sources
(Houlihan Lokey, McKinsey, PwC, the Fed) that Tavily did not — those carry weight in
a deal context. But Tavily's grounding in Stripe's *primary* annual letter is a
legitimate strength, and **both** dipped into stat-aggregator/SEO blogs. It's an edge,
not a rout.

**One clean, factual product-level difference:** Exa's Research API returns citations
with **published dates, authors, and scored text excerpts**; Tavily's `sources` are
**title + url + favicon only** — no dates, no excerpts, no scores. For an analyst who
must date- and quote-check every claim, that's a tangible Exa advantage. *(Caveat: our
current Exa **seed** only stored `source_name` + `url`, so the demo doesn't yet surface
Exa's dates/excerpts — we could, in Phase 2.)*

---

## 4. Comprehensiveness — **Parity (4 vs 4)**

This is the dimension where I expected an Exa win and **did not find one.** Tavily's
output is, if anything, **denser on Stripe-specific financials** despite ⅓ the sources.

**Tavily surfaced specifics Exa did not**, e.g.:
- A **Jan-2026 internal 409A of $106.7B** (verified true — Exa's seed jumped straight
  to $159B and missed this step).
- **Stripe Payments International Holdings** net revenue **$3.8B (2023)** — a UK-filing
  figure.
- An explicit **~17.9× EV/2024-net-revenue** multiple on the $91.5B tender.
- **Product-line revenue signals**: ~$3.4B subscription, ~$800M Terminal, ~$500M Radar.
- **Stablecoin economics**: ~$400B 2025 volume, ~1.5% vs ~2.9% card fee.
- A different M&A comp set: **Adyen/Talon.One (€750M)**, **Rapyd/PayU GPO ($610M)**,
  **GTCR/Worldpay Merchant Solutions ($18.5B)**, **Mastercard/Corpay ($300M @ ~$13B)**.

**Exa surfaced specifics Tavily did not**, e.g.:
- **Capital One/Brex $5.15B** (~13.4× headline) and **Ramp $750M @ $44B** (dated
  **June 4 2026**, *days* before the run — excellent recency), **Francisco
  Partners/Moneris ~$2B**, **Global Payments/Worldpay**.
- A **~7.7× sector EV/Revenue** anchor and broader **regulatory** context (Fed,
  Ballard Spahr).
- **Stripe Sessions 2026** product depth (~288 features).

**Honest read.** The two engines retrieved **complementary, not overlapping**, comp
sets — both legitimate for pre-deal work. Exa cast a **wider net** (43 sources, more
sector M&A breadth); Tavily extracted **denser company-level financial detail** from
fewer sources. Calling either "more comprehensive" would be cherry-picking. **Parity.**

---

## 5. Synthesis & structure — **Exa edge (4 vs 3), and the most *demonstrable* one**

Both produced valid structured JSON. The difference is in *readability and analytical
voice* — and it's visible at a glance, which makes it the best dimension to *show* in
the demo.

**Exa reads like a finished analyst brief** (competitive_landscape, verbatim):
> "Stripe competes across several fronts rather than against a single rival. In
> enterprise payments its primary competitor is Adyen, the Amsterdam-listed processor
> known for a single-platform architecture and strong profitability, which has won
> large merchants on unit economics."

**Tavily reads like annotated research notes** (competitive_landscape, verbatim):
> "Direct and adjacent competitors **identified in the findings** include PayPal,
> Block (Square), Adyen, Checkout.com, FIS/Worldpay, Global Payments, Visa, Mastercard,
> PayU, Razorpay and regional/vertical players **noted in press**."

Tavily repeatedly breaks the fourth wall — *"identified in the findings,"* *"research
sources report,"* *"the findings document,"* *"sources conflict."* It's denser and
arguably **more transparent** (it flags that the $140B vs $159B and $49T vs $857B
figures disagree), but it reads less like a client-ready deliverable and more like a
RAG dump with hedges. For Acuity's "investment-grade brief" framing, **Exa's narrative
polish is the relevant strength**, and paired excerpts make it obvious on screen.

*Fair counterpoint:* a diligence analyst might *prefer* Tavily's "show me the conflicts"
transparency. So this is "edge for a polished deliverable," not "Tavily is bad."

---

## 6. Accuracy & grounding — **Parity (5 vs 5)**

Every specific, checkable claim I tested from **both** engines held up against primary
reporting:

| Claim | Engine | Verdict | Source |
|---|---|---|---|
| Capital One acquires Brex, $5.15B ($2.75B cash + 10.6M shares) | Exa | ✅ True | CNBC, Jan 22 2026 |
| Ramp $750M Series F @ $44B (Jun 4 2026) | Exa | ✅ True | TechCrunch/Bloomberg |
| Stripe completes Metronome acq. (~$1B, Jan 13 2026) | Tavily | ✅ True | Stripe newsroom / PYMNTS |
| Stripe Jan-2026 409A = $106.7B | Tavily | ✅ True | Axios / The Information / Sacra |
| Stripe Feb-2026 valuation ~$159B (+34% volume) | Both | ✅ True | Bloomberg / CNBC |
| PayPal "43–45% of online payment processing" | Tavily | ⚠️ Sourced but imprecise | Datanyze (tech-install share, not volume) |
| Payments market "$49.10T" vs "$857.83B" in 2026 | Tavily | ⚠️ Two SEO figures, flagged as conflicting | Mordor / market.us |

**Honest read.** Neither engine hallucinated a headline fact. Tavily even caught a
*more precise* valuation step (the 409A) than Exa; Exa caught a *fresher* data point
(Ramp, days old). **Both** occasionally lean on stat-aggregator/SEO sources for
secondary figures (Exa: Chargeflow; Tavily: PayCompass, market.us), and **both**
outputs would require an analyst to verify before use. This is a **clean tie** — and
saying so out loud is what keeps the whole comparison credible.

---

## 7. The honest overall picture (and what it means for the demo)

Exa wins or ties **every** dimension, but the wins are **modest** and two dimensions
are **genuine ties**. The defensible one-liner is:

> *"On the same investment-banking brief, Exa pulled more authoritative sources,
> wrote a more client-ready synthesis, and finished ~1.8× faster — while matching
> Tavily on factual accuracy and raw comprehensiveness."*

That is credible to a co-founder *because* it concedes the ties. A "we crush them"
claim would be caught and would cost trust.

**But the bigger point:** this single query is a *weak* test of Exa's actual moat. An
IB brief is a general deep-research task — the part of the market where Tavily is most
competitive. Exa's hardest-to-match capabilities are **structural**: dedicated
**company** and **people (LinkedIn-scale)** search, **code** and **research-paper**
indexes, and semantic **find-similar** — "7 result categories vs 3," and Tavily has no
equivalent. None of that is exercised here. So if the demo rests *only* on the Stripe
brief, it undersells Exa.

**Recommendation for the comparison section (for your approval):**

- **(Core, do this) Evidence-anchored scorecard on Stripe.** Render the five-row
  scorecard above, and make each rating *expandable* into the *actual evidence* from
  this run — the real source lists with authority tags, the paired competitive-landscape
  excerpts, the accuracy table. Concede the ties (accuracy, comprehensiveness) openly.
  This is honest, specific, and the integrity *is* the sell.
- **(Strongly recommended add) One capability the brief can't show.** Add a short,
  honest callout — or a second tiny live example — that exercises Exa's structural edge
  (e.g., *"find the 8 closest comparable companies to Stripe, with founders and latest
  valuations"* via Exa's company/people search), where Tavily is **structurally** unable
  to compete. This is where the *real* Exa advantage lives, and it's a clean win rather
  than a modest one.
- **(Drop)** the "no synthesis / raw results" framing entirely.

---

## 8. For your conviction: Exa vs. OpenAI / Anthropic Deep Research

You asked this for yourself, so — straight, not a pitch.

**They're different layers.** OpenAI Deep Research and Anthropic's research are
*agentic products* (a frontier reasoning model + browsing). Exa is **retrieval
infrastructure** — its own AI-native web index — that *also* ships a Research product.
The labs sell the car; Exa sells an engine every car needs.

**Why the bet is credible (bull):**
- Every research agent needs web grounding. OpenAI leans on Bing; Anthropic on web
  tools — **neither owns a purpose-built-for-AI index.** Whoever has the best one
  becomes the substrate. Exa is the leading *independent* such index, and independent
  benchmarks (e.g., AIMultiple) put it in the top tier on agentic search.
- Buyers like Grasp/DiligenceSquared won't build on a consumer chatbot; they need
  programmable, structured, fast, cheap retrieval — Exa's exact shape.
- **Unit economics**: Exa research is ~cents/call; lab "deep research" is dollars/task.
  At thousands of briefs, that gap decides the business model.
- Model-agnostic — bring your own LLM for synthesis; no lab lock-in.

**Why to stay clear-eyed (bear):**
- Exa's *synthesis/reasoning* layer likely trails o-series / Claude — this Stripe run
  shows Exa's edge is **retrieval and packaging**, not frontier reasoning. If value
  concentrates in reasoning, the labs own the product layer.
- **Google** already owns the best index *and* a frontier model; the labs could build
  their own indexes. Exa's whole thesis is that *purpose-built-for-AI index quality +
  independence + API-first* wins enough share before that happens.
- $250M Series C is strong but orders of magnitude below the labs' war chests.

**My honest take:** Exa is a credible — arguably compelling — *picks-and-shovels*
infrastructure bet, **conditional on the index genuinely being best-for-AI**.
Independent evidence supports that on **complex / semantic / entity** queries (where
investment research lives) and is contested on simple factual lookup. This Stripe
exercise is one small, real-world data point *in favor*: Exa's retrieval pulled more
authoritative, fresher sources and packaged them better than a serious, well-funded
competitor — while never fabricating. That's a reasonable foundation for conviction,
provided you weight Exa as a **retrieval/index** company first and a research-*product*
company second.

---

## 9. What I need from you before Phase 2 (build)

1. **Approve the comparison design** in §7: evidence-anchored scorecard (core) + the
   honest "drop the strawman" rewrite. **Yes/adjust?**
2. **The capability add-on** (§7, the find-comparables/people example that exercises
   Exa's structural edge): **include it, or keep the demo to the Stripe brief only?**
3. **Any ratings you disagree with?** I tried to be hard on Exa (two ties, modest
   edges). If you think I've mis-scored a dimension, push back and I'll re-examine the
   evidence.

Once you're satisfied this is honest, I'll build it (Tavily seed + scorecard UI +
inline evidence + the two copy fixes) through the normal PR → Gemini → develop → main
→ deploy flow.

---

## 10. Act 3 evidence — structured comparables (run after Phase-1 approval)

**Setup.** Same job for both engines: *"the 8 companies most comparable to Stripe,
each with founder/CEO + latest valuation."* Exa via its **company-index search**
(`category:"company"` + structured summary — Websets requires a Pro plan this account
doesn't have, so this is Exa's available company-index path). Tavily via its best
structured tool, **Research + `output_schema`** (array of company objects). Each
vendor's best available tool for the job; disclosed.

**Latency (the headline).** Exa company search: **~5 seconds.** Tavily comparables
research: **256 seconds (4.3 min).** ~50× faster for structured entity retrieval —
the cleanest Act-3 win and the one a developer feels instantly.

**Comp-set relevance.** Both nailed the obvious core — Adyen, PayPal, Block,
Checkout.com, Rapyd (5 shared). The difference is the *other* picks:
- **Exa added the large-scale processors** that are true Stripe-scale comps:
  **FIS (~$23B), Global Payments (~$18B), Nuvei ($6.3B take-private)**.
- **Tavily drifted to smaller, narrower fintechs**: **Marqeta (~$1.6B, card-issuing
  only)** and **Payoneer (~$1.7B, cross-border only)** — payments-adjacent but an
  order of magnitude smaller, less comparable to Stripe's scale/breadth. (Tavily also
  returned only **7 of 8** requested.)
- For an IB comp table, Exa's set is the more apt — a mild but real relevance edge.

**Enrichment accuracy — a wash, and a caution for me.** Both got founders right.
Notably, *both* engines — and PayPal's own IR page — state PayPal's CEO is **Enrique
Lores (appointed March 2026)**; my own prior knowledge said otherwise, so I nearly
"corrected" a *correct* answer. Lesson reinforced: trust the sourced output over stale
priors. On valuations, **both** carried some stale figures (Tavily: Adyen "$35.1B
(2024)", Rapyd "$10B"; Exa's raw summary: Adyen "€55.4B") — so for the demo cards I
**verified and corrected every figure** against current sources. Neither is reliably
more accurate on enrichment; both need verification.

**Sourcing.** Exa returns company *entities* (each result is the company, with its
site). Tavily leaned heavily on **Wikipedia** (Adyen, Block, Checkout, Payoneer) plus
GlobalData/companiesmarketcap/Britannica — and, oddly, its top source list was
dominated by **PayU** pages for a company it didn't even include. Per-entity
provenance is cleaner on the Exa side.

**Honest Act-3 verdict.** Exa wins this one more clearly than the deep-research brief —
but the win is **retrieval, speed, and comp relevance**, *not* "Tavily can't." Both
produced a real structured comp set; Exa's company index just did it ~50× faster, with
more scale-appropriate peers and cleaner per-entity sourcing. That's the defensible,
demonstrable close — and it's the part of Exa's moat the deep-research brief alone
couldn't show.

**The 8 demo cards (Exa-surfaced, figures verified):** Adyen (~$30B, van der Does/
Schuijff) · PayPal (~$38B, CEO Enrique Lores) · Block (~$40B, Jack Dorsey) ·
Checkout.com ($40B '22 → $12B '25, Guillaume Pousaz) · FIS (~$23B, Stephanie Ferris) ·
Global Payments (~$18B, Cameron Bready) · Nuvei ($6.3B take-private, Philip Fayer) ·
Rapyd (~$4.5B, Arik Shtilman).
