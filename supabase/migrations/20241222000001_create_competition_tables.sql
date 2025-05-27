CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  thumbnail_url TEXT,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  prize_value VARCHAR(50),
  prize_currency VARCHAR(3) DEFAULT 'USD',
  category VARCHAR(100) NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  max_entries INTEGER,
  entry_fee DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS competition_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  requirement_text TEXT NOT NULL,
  requirement_type VARCHAR(50) DEFAULT 'general',
  is_mandatory BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competition_eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  eligibility_text TEXT NOT NULL,
  eligibility_type VARCHAR(50) DEFAULT 'general',
  min_age INTEGER,
  max_age INTEGER,
  location_restriction VARCHAR(255),
  profession_restriction VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, competition_id)
);

CREATE INDEX IF NOT EXISTS idx_competitions_category ON competitions(category);
CREATE INDEX IF NOT EXISTS idx_competitions_difficulty ON competitions(difficulty);
CREATE INDEX IF NOT EXISTS idx_competitions_deadline ON competitions(deadline);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competition_requirements_competition_id ON competition_requirements(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_eligibility_competition_id ON competition_eligibility(competition_id);
CREATE INDEX IF NOT EXISTS idx_saved_competitions_user_id ON saved_competitions(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_competitions_competition_id ON saved_competitions(competition_id);

alter publication supabase_realtime add table competitions;
alter publication supabase_realtime add table competition_requirements;
alter publication supabase_realtime add table competition_eligibility;
alter publication supabase_realtime add table saved_competitions;