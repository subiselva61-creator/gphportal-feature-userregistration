Here’s README-ready copy you can paste into the GitHub **About** / README tab:

---

## Green Hydrogen Portal (Green Power House)

### What this app does

**Green Hydrogen Portal** is a web platform for **green-hydrogen investment discovery and validation**. It helps project developers, investors, and analysts explore the global hydrogen project pipeline, understand who is investing where, find relevant matches with AI, and stay current on sector news — in one place.

The product combines:
- An **IEA-aligned hydrogen projects explorer** (map, filters, capacity/stage views)
- An **investor intelligence** directory and world map
- An **AI matching engine** for semantic project/investor discovery
- A **green-hydrogen news dashboard** across investment, technology, policy, and markets

---

### Who it’s for

| Audience | How they use it |
|----------|-----------------|
| **Investors & funds** | Validate deals, scan geography/strategy, find matching projects |
| **Project developers** | Explore the pipeline, compare status/tech/capacity, research peers |
| **Analysts & researchers** | Track production/infrastructure signals, read IEA review content, follow news |
| **Registered business users** | Sign up with company details (including VAT), access gated tools |

Guests can view the home experience and the news feed. **Projects, Investors, AI Matching, and Profile** require login.

---

### Core features

**1. Overview / Home**  
Landing hub for “Green Hydrogen Investment Discovery” with entry points to Projects, Investors, and AI Matching. When logged in, featured projects and top investors are loaded.

**2. Projects hub** (login required)  
Explore the hydrogen project landscape with multiple views:
- **Project map** — Interactive Leaflet map with technology colors, status pipeline, capacity-based markers, filters (region, country, technology, status, year), plus a searchable project table
- **Production** — Charts for historical production and pipeline by technology/status
- **Infrastructure** — Pipeline and storage analytics (announced vs historical, onshore/offshore)
- **Production cost** — Regional cost views and pathway-style charts
- **Global Hydrogen Review 2025** — In-app reader for synced IEA GHR 2025 chapter content with table-of-contents navigation

**3. Investors** (login required)  
World map and directory of investors with geography, strategy, investment size, and notable activity. Supports geography search, with sample fallback data if the API is unavailable.

**4. AI Matching Engine** (login required)  
Natural-language queries plus filters to rank projects and investors. Uses semantic search (embeddings) and optional rule-based top-match ranking so users can turn a thesis into a shortlist.

**5. News**  
Categorized green-hydrogen news feed (investment, projects/infrastructure, technology, policy, market), aggregated from external providers with caching.

**6. Auth, profile & billing**  
- Email/password registration and login, plus Google sign-in  
- Business-oriented signup (name, address, business name, VAT)  
- JWT-based session (stored client-side)  
- Profile page with account, roles, and payment status  
- Stripe checkout UI for payments (billing integration may still be evolving)

---

### Main user flows

1. **Onboard** — Register as a business user → optional payment step → sign in (email or Google)  
2. **Research projects** — Open Projects → filter the map/table → dig into production, infrastructure, cost, or GHR 2025  
3. **Validate investors** — Browse the investor map/list and cross-check with projects  
4. **Discover with AI** — Describe what you’re looking for → get ranked projects/investors  
5. **Monitor the market** — Use News for ongoing sector coverage  

---

### Tech stack

| Layer | Stack |
|-------|--------|
| **Frontend** | React, React Router, Redux Toolkit, Axios, Bootstrap, Leaflet, Recharts, Formik/Yup, Stripe.js |
| **Backend** | ASP.NET Core (C#) Web API, Swagger, JWT auth |
| **Database** | MongoDB (Users, Projects, Investors, filters); local JSON fallbacks for development |
| **AI / search** | Semantic embeddings (e.g. Ollama) for project/investor matching |
| **News** | Aggregated RSS / news APIs with caching |

Dev setup typically runs the React app on `http://localhost:3000` with the API on `http://localhost:8080` (proxied via `/api`).

---

### Short blurb (for the GitHub About description field)

> Web platform for green-hydrogen investment discovery: IEA-aligned project maps & trackers, investor intelligence, AI semantic matching, and a live sector news feed — built with React and ASP.NET Core/MongoDB.

---

If you want, I can turn this into a full root `README.md` in the repo (with install/run steps) next.
