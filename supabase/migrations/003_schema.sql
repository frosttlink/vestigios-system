-- Add session_count to characters
ALTER TABLE personagens ADD COLUMN session_count INT DEFAULT 0;

-- Enemies table (persisted to database)
CREATE TABLE inimigos (
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

-- Masters can manage enemies in their campaigns
CREATE POLICY "Masters manage enemies"
  ON inimigos FOR ALL
  USING (
    auth.uid() IN (
      SELECT master_id FROM campanhas WHERE id = campaign_id
    )
  );

-- Members can view enemies in their campaigns
CREATE POLICY "Members view enemies"
  ON inimigos FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM campanha_membros WHERE campanha_id = campaign_id
    )
  );

-- Campaign editing policy: members can update campaigns
CREATE POLICY "Members can update campaigns"
  ON campanhas FOR UPDATE
  USING (
    auth.uid() = master_id
    OR auth.uid() IN (
      SELECT user_id FROM campanha_membros WHERE campanha_id = id
    )
  );
