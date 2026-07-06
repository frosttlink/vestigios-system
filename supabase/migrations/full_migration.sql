-- ============================================
-- Vestígios System — Idempotent Migration
-- Safe to run even if some objects already exist
-- ============================================

-- 001_schema.sql (safe re-run)
CREATE TABLE IF NOT EXISTS personagens (
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

ALTER TABLE personagens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'personagens' AND policyname = 'Users can view own characters') THEN
    CREATE POLICY "Users can view own characters" ON personagens FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'personagens' AND policyname = 'Users can create own characters') THEN
    CREATE POLICY "Users can create own characters" ON personagens FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'personagens' AND policyname = 'Users can update own characters') THEN
    CREATE POLICY "Users can update own characters" ON personagens FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'personagens' AND policyname = 'Users can delete own characters') THEN
    CREATE POLICY "Users can delete own characters" ON personagens FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'personagens_updated_at') THEN
    CREATE TRIGGER personagens_updated_at BEFORE UPDATE ON personagens FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS campanhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  characters UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE campanhas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campanhas' AND policyname = 'Masters can view own campaigns') THEN
    CREATE POLICY "Masters can view own campaigns" ON campanhas FOR SELECT USING (auth.uid() = master_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campanhas' AND policyname = 'Masters can create campaigns') THEN
    CREATE POLICY "Masters can create campaigns" ON campanhas FOR INSERT WITH CHECK (auth.uid() = master_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campanhas' AND policyname = 'Masters can update own campaigns') THEN
    CREATE POLICY "Masters can update own campaigns" ON campanhas FOR UPDATE USING (auth.uid() = master_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campanhas' AND policyname = 'Masters can delete own campaigns') THEN
    CREATE POLICY "Masters can delete own campaigns" ON campanhas FOR DELETE USING (auth.uid() = master_id);
  END IF;
END $$;

-- 002_schema.sql
CREATE TABLE IF NOT EXISTS campanha_membros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campanha_id UUID NOT NULL REFERENCES campanhas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id UUID REFERENCES personagens(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campanha_id, user_id)
);

ALTER TABLE campanha_membros ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campanha_membros' AND policyname = 'Members view own memberships') THEN
    CREATE POLICY "Members view own memberships" ON campanha_membros FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campanha_membros' AND policyname = 'Masters view campaign members') THEN
    CREATE POLICY "Masters view campaign members" ON campanha_membros FOR SELECT USING (auth.uid() IN (SELECT master_id FROM campanhas WHERE id = campanha_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campanha_membros' AND policyname = 'Players can join campaign') THEN
    CREATE POLICY "Players can join campaign" ON campanha_membros FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campanha_membros' AND policyname = 'Players can update own membership') THEN
    CREATE POLICY "Players can update own membership" ON campanha_membros FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campanha_membros' AND policyname = 'Players can delete own membership') THEN
    CREATE POLICY "Players can delete own membership" ON campanha_membros FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS campanha_convites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campanha_id UUID NOT NULL REFERENCES campanhas(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  description TEXT DEFAULT '',
  usado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE campanha_convites ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campanha_convites' AND policyname = 'Masters manage invites') THEN
    CREATE POLICY "Masters manage invites" ON campanha_convites FOR ALL USING (auth.uid() IN (SELECT master_id FROM campanhas WHERE id = campanha_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campanha_convites' AND policyname = 'Anyone can read invite') THEN
    CREATE POLICY "Anyone can read invite" ON campanha_convites FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'personagens' AND policyname = 'Masters can view member characters') THEN
    CREATE POLICY "Masters can view member characters" ON personagens FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT master_id FROM campanhas WHERE id IN (SELECT campanha_id FROM campanha_membros WHERE character_id = personagens.id)));
  END IF;
END $$;

-- 003_schema.sql
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personagens' AND column_name = 'session_count') THEN
    ALTER TABLE personagens ADD COLUMN session_count INT DEFAULT 0;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS inimigos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campanhas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  vida INT DEFAULT 20,
  vida_max INT DEFAULT 20,
  defesa INT DEFAULT 10,
  pa INT DEFAULT 50,
  pa_max INT DEFAULT 50,
  tamanho TEXT DEFAULT 'Medio',
  caracteristicas TEXT DEFAULT '',
  ponto_fraco TEXT DEFAULT '',
  ataques JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE inimigos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inimigos' AND policyname = 'Masters manage enemies') THEN
    CREATE POLICY "Masters manage enemies" ON inimigos FOR ALL USING (auth.uid() IN (SELECT master_id FROM campanhas WHERE id = campaign_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inimigos' AND policyname = 'Members view enemies') THEN
    CREATE POLICY "Members view enemies" ON inimigos FOR SELECT USING (auth.uid() IN (SELECT user_id FROM campanha_membros WHERE campanha_id = campaign_id));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campanhas' AND policyname = 'Members can update campaigns') THEN
    CREATE POLICY "Members can update campaigns" ON campanhas FOR UPDATE USING (auth.uid() = master_id OR auth.uid() IN (SELECT user_id FROM campanha_membros WHERE campanha_id = id));
  END IF;
END $$;
