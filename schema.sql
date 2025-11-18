-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  hackathon_name TEXT NOT NULL,
  hackathon_date DATE,
  prize TEXT,
  devpost_url TEXT UNIQUE,
  github_url TEXT,
  demo_url TEXT,
  video_url TEXT,
  image_url TEXT,
  technologies TEXT[],
  
  -- Post-hackathon tracking
  got_funding BOOLEAN DEFAULT false,
  funding_amount NUMERIC,
  funding_source TEXT,
  became_startup BOOLEAN DEFAULT false,
  startup_name TEXT,
  startup_url TEXT,
  has_real_users BOOLEAN DEFAULT false,
  user_count INTEGER,
  is_still_active BOOLEAN,
  last_activity_date DATE,
  
  -- AI scoring (0-100)
  market_score INTEGER,
  team_score INTEGER,
  innovation_score INTEGER,
  execution_score INTEGER,
  overall_score INTEGER,
  
  -- Research
  research_summary TEXT,
  research_sources TEXT[],
  researched_at TIMESTAMP,
  source_type TEXT DEFAULT 'devpost',
  origin_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Founders table
CREATE TABLE founders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  twitter_url TEXT,
  
  -- Background
  "current_role" TEXT,
  current_company TEXT,
  location TEXT,
  bio TEXT,
  
  -- Post-hackathon journey
  founded_startup BOOLEAN DEFAULT false,
  joined_company TEXT,
  raised_funding BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project-Founder relationship
CREATE TABLE project_founders (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  founder_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  role TEXT,
  PRIMARY KEY (project_id, founder_id)
);

-- Indexes for performance
CREATE INDEX idx_projects_hackathon ON projects(hackathon_name);
CREATE INDEX idx_projects_score ON projects(overall_score DESC);
CREATE INDEX idx_projects_funding ON projects(got_funding);
CREATE INDEX idx_projects_startup ON projects(became_startup);
CREATE INDEX idx_founders_name ON founders(name);
