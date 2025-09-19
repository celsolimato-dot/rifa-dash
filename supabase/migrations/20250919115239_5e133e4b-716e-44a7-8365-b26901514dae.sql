-- Add winner tracking fields to raffles table
ALTER TABLE public.raffles 
ADD COLUMN winner_name VARCHAR(255),
ADD COLUMN winner_email VARCHAR(255), 
ADD COLUMN winning_number VARCHAR(10),
ADD COLUMN draw_completed_at TIMESTAMP WITH TIME ZONE;

-- Add index for querying completed raffles with winners
CREATE INDEX IF NOT EXISTS idx_raffles_winner_status ON raffles(status, draw_completed_at) WHERE winner_name IS NOT NULL;

-- Add comments for new columns
COMMENT ON COLUMN raffles.winner_name IS 'Nome do vencedor da rifa';
COMMENT ON COLUMN raffles.winner_email IS 'Email do vencedor da rifa';
COMMENT ON COLUMN raffles.winning_number IS 'Número sorteado vencedor';
COMMENT ON COLUMN raffles.draw_completed_at IS 'Data e hora que o sorteio foi realizado';