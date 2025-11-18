# Startuate - Hackathon Winners Discovery Platform

Demo-ready MVP for tracking hackathon projects that became real startups.

## Quick Start

### 1. Setup Environment

```bash
npm install
cp .env.example .env
```

Edit `.env` with your API keys:
- `SUPABASE_URL` & `SUPABASE_KEY` - from supabase.com
- `OPENAI_API_KEY` - from openai.com (or use OpenRouter)
- `EXA_API_KEY` - from exa.ai

**Existing databases:** add the latest columns so web-discovered projects can be stored:

```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'devpost';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS origin_url TEXT;
```

### Optional: Use OpenRouter (Multi-LLM Support)

To use OpenRouter instead of OpenAI (access to multiple LLM providers):

```bash
# Enable OpenRouter
USE_OPENROUTER=true
OPENROUTER_API_KEY=sk-or-v1-...

# Optional: Specify model (default: openai/gpt-4-turbo)
OPENROUTER_MODEL=anthropic/claude-3-opus
# or: openai/gpt-4-turbo, google/gemini-pro, meta-llama/llama-3-70b, etc.

# Optional: App metadata
OPENROUTER_HTTP_REFERER=https://yourdomain.com
OPENROUTER_APP_NAME=Hackathon Discovery
```

See [OpenRouter Models](https://openrouter.ai/models) for available models.

### 2. Setup Database

Run the schema in your Supabase SQL editor:
```bash
cat schema.sql
```

### 3. Scrape Hackathon Winners

```bash
npm run scrape
```

This will scrape 10 projects from Devpost and save to database.

### 4. Research Projects

```bash
npm run research
```

Uses Exa + LLM (OpenAI or OpenRouter) to research which projects got funding, became startups, or got real users.

**Agentic Mode** (default): Uses AI to generate adaptive search queries and prioritize hackathons.
```bash
npm run research              # Agentic mode (default)
npm run research -- --no-agentic  # Scripted mode
```

### 5. Start API Server

```bash
npm run dev
```

Server runs on http://localhost:3000

**Note:** The backend is now built with TypeScript. See [README-BACKEND.md](./README-BACKEND.md) for architecture details.

### 6. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

The frontend is built with Vue 3 + TypeScript, featuring a minimalistic black and white design.

### 7. Deep Success Stories Research

Use this when you want a dedicated pass over all projects to verify funding/startup signals with detailed reasoning and source links:

```bash
npm run success-stories
```

This script:
- re-checks projects across the broader web (not just Devpost)
- writes achievements, reasoning, timelines, and key metrics into `research_summary`
- stores every source URL in `research_sources` for verification
- surfaces detailed evidence for leaderboard & success stories in the frontend

### 8. Discover Success Stories from the Web

Run a success-first discovery that scans the wider internet (PRs, blog posts, coverage) and links findings back to hackathon projects—with full reasoning and verification links:

```bash
npm run discover-success            # process ~25 candidates
npm run discover-success 10         # limit to 10 candidates
```

This command:
- searches for post-hackathon funding launches and wins
- creates or updates projects with `source_type = 'web'`
- feeds findings through the deep `analyzeSuccessStory` agent
- stores achievements, “why it succeeded”, metrics, timeline, and all source URLs

## API Endpoints

- `GET /api/projects` - All projects
- `GET /api/leaderboard` - Top scored projects
- `GET /api/success-stories` - Funded/startup projects
- `GET /api/stats` - Platform statistics
- `POST /api/scrape` - Trigger scraper
- `POST /api/research/:id` - Research specific project

## Demo Flow for VCs

1. Show homepage with stats (X projects tracked, Y got funding)
2. Click "Success Stories" tab - show projects that raised capital
3. Click individual project - show AI analysis and scoring
4. Explain: "We scrape major hackathons, research founders, score investment potential"

## Tech Stack

- **Backend**: Node.js + Express + TypeScript + Supabase (MVC architecture with tests)
- **Scraping**: Axios + Cheerio (Devpost)
- **Research**: Exa AI + LLM (OpenAI/OpenRouter with agentic capabilities)
- **Frontend**: Vue 3 + TypeScript + Vite (minimalistic black & white design)
- **Testing**: Mocha + Chai + Supertest (backend), Vitest (frontend)

## Next Steps

- Add more hackathon platforms (HackYeah, Pixel Riot, etc.)
- Implement founder LinkedIn scraping
- Add email alerts for VCs on new high-scoring projects
- Build VC portal with saved searches
