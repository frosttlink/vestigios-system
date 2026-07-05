CREATE TABLE personagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  backstory TEXT DEFAULT '',
  fears TEXT DEFAULT '',
  forca INT DEFAULT 0 CHECK (forca >= 0 AND forca <= 3),
  velocidade INT DEFAULT 0 CHECK (velocidade >= 0 AND velocidade <= 3),
  resistencia INT DEFAULT 0 CHECK (resistencia >= 0 AND resistencia <= 3),
  sabedoria INT DEFAULT 0 CHECK (sabedoria >= 0 AND sabedoria <= 3),
  carisma INT DEFAULT 0 CHECK (carisma >= 0 AND carisma <= 3),
  actions JSONB DEFAULT '{}',
  role TEXT DEFAULT NULL,
  pi INT DEFAULT 5,
  pt INT DEFAULT 0,
  vida_max INT DEFAULT 0,
  mente_max INT DEFAULT 0,
  vida_atual INT DEFAULT 0,
  mente_atual INT DEFAULT 0,
  inventory JSONB DEFAULT '[]',
  equipment JSONB DEFAULT '[]',
  conditions TEXT[] DEFAULT '{}',
  traumas TEXT[] DEFAULT '{}',
  powers JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE personagens ENABLE ROW LEVEL SECURITY;

-- Users can only see their own characters
CREATE POLICY "Users can view own characters"
  ON personagens FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own characters
CREATE POLICY "Users can create own characters"
  ON personagens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own characters
CREATE POLICY "Users can update own characters"
  ON personagens FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own characters
CREATE POLICY "Users can delete own characters"
  ON personagens FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER personagens_updated_at
  BEFORE UPDATE ON personagens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TABLE campanhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  characters UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE campanhas ENABLE ROW LEVEL SECURITY;

-- Master can see their own campaigns
CREATE POLICY "Masters can view own campaigns"
  ON campanhas FOR SELECT
  USING (auth.uid() = master_id);

-- Master can create campaigns
CREATE POLICY "Masters can create campaigns"
  ON campanhas FOR INSERT
  WITH CHECK (auth.uid() = master_id);

-- Master can update their campaigns
CREATE POLICY "Masters can update own campaigns"
  ON campanhas FOR UPDATE
  USING (auth.uid() = master_id);

-- Master can delete their campaigns
CREATE POLICY "Masters can delete own campaigns"
  ON campanhas FOR DELETE
  USING (auth.uid() = master_id);
