-- Campaign members join table
CREATE TABLE campanha_membros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campanha_id UUID NOT NULL REFERENCES campanhas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id UUID REFERENCES personagens(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campanha_id, user_id)
);

ALTER TABLE campanha_membros ENABLE ROW LEVEL SECURITY;

-- Members can see own memberships
CREATE POLICY "Members view own memberships"
  ON campanha_membros FOR SELECT
  USING (auth.uid() = user_id);

-- Masters can see all members of their campaigns
CREATE POLICY "Masters view campaign members"
  ON campanha_membros FOR SELECT
  USING (
    auth.uid() IN (
      SELECT master_id FROM campanhas WHERE id = campanha_id
    )
  );

-- Players can join (insert themselves)
CREATE POLICY "Players can join campaign"
  ON campanha_membros FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Players can leave / update own membership
CREATE POLICY "Players can update own membership"
  ON campanha_membros FOR UPDATE
  USING (auth.uid() = user_id);

-- Players can remove themselves
CREATE POLICY "Players can delete own membership"
  ON campanha_membros FOR DELETE
  USING (auth.uid() = user_id);

-- Campaign invites
CREATE TABLE campanha_convites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campanha_id UUID NOT NULL REFERENCES campanhas(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  description TEXT DEFAULT '',
  usado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE campanha_convites ENABLE ROW LEVEL SECURITY;

-- Masters can manage invites for their campaigns
CREATE POLICY "Masters manage invites"
  ON campanha_convites FOR ALL
  USING (
    auth.uid() IN (
      SELECT master_id FROM campanhas WHERE id = campanha_id
    )
  );

-- Anyone can read an invite by token (validated in-app)
CREATE POLICY "Anyone can read invite"
  ON campanha_convites FOR SELECT
  USING (true);

-- Masters can view member characters (limited data) for their campaigns
CREATE POLICY "Masters can view member characters"
  ON personagens FOR SELECT
  USING (
    -- Own characters
    auth.uid() = user_id
    OR
    -- Characters of campaign members (for master view)
    auth.uid() IN (
      SELECT master_id FROM campanhas WHERE id IN (
        SELECT campanha_id FROM campanha_membros WHERE character_id = personagens.id
      )
    )
  );
