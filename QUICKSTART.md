# Quick Start for e2vc Demo

## Setup (5 minutes)

1. **Install dependencies:**
```bash
npm install
```

2. **Configure `.env`:**
```bash
cp .env.example .env
```
Add your keys:
- SUPABASE_URL + SUPABASE_KEY (from Supabase dashboard)
- OPENAI_API_KEY (from OpenAI)
- EXA_API_KEY (from Exa)

3. **Setup Supabase:**
- Go to Supabase SQL Editor
- Copy/paste contents of `schema.sql`
- Run it

4. **Seed demo data (30 seconds):**
```bash
npm run seed
```
This adds 6 real success stories (DocSend→$165M, Primer→$120M, etc.)

5. **Start server:**
```bash
npm run dev
```

6. **Open frontend:**
Open `frontend/index.html` in browser

## Demo Flow for e2vc

1. Show homepage stats: "6 projects, 6 got funding, 6 became startups"
2. Click "Success Stories" - show DocSend ($165M exit), Primer ($120M raised)
3. Click a project - show AI scoring breakdown
4. Pitch: "We track hackathon winners, research their journey, score investment potential"

## Optional: Add Live Data

```bash
npm run scrape   # Scrapes 15 projects from Devpost (takes 1 min)
npm run research # AI research on scraped projects (takes 3-5 min)
```

## What VCs See

- **Hall of Fame**: All winning projects with scores
- **Success Stories**: Filtered view of funded projects
- **Scoring**: Market/Team/Innovation/Execution (0-100)
- **Research**: Post-hackathon outcomes tracked automatically
