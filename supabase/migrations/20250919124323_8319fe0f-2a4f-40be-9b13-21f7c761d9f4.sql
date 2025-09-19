-- Fix RLS policies for raffles table to allow winners to see their won raffles

-- Drop existing policy that only allows active/completed raffles for everyone
DROP POLICY IF EXISTS "Permitir leitura de rifas ativas para todos" ON raffles;

-- Create new policy: Allow everyone to see active, completed, and finished raffles
CREATE POLICY "Permitir leitura pública de rifas"
ON raffles
FOR SELECT
USING (
  status IN ('active', 'completed', 'finished')
);

-- Create new policy: Allow authenticated users to see raffles where they are the winner
CREATE POLICY "Ganhadores podem ver suas rifas ganhas"
ON raffles
FOR SELECT
TO authenticated
USING (
  winner_email = (auth.jwt() ->> 'email')
);