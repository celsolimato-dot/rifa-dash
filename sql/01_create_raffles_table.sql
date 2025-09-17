-- Criação da tabela raffles
-- Esta tabela armazena informações sobre as rifas criadas no sistema

CREATE TABLE IF NOT EXISTS raffles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  prize VARCHAR(255) NOT NULL,
  prize_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  ticket_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_tickets INTEGER NOT NULL DEFAULT 0,
  sold_tickets INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'paused', 'finished', 'draft')),
  draw_date TIMESTAMP WITH TIME ZONE NOT NULL,
  category VARCHAR(100) NOT NULL,
  institution_name VARCHAR(255),
  institution_logo TEXT,
  description TEXT,
  image_url TEXT,
  revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_raffles_status ON raffles(status);
CREATE INDEX IF NOT EXISTS idx_raffles_category ON raffles(category);
CREATE INDEX IF NOT EXISTS idx_raffles_created_by ON raffles(created_by);
CREATE INDEX IF NOT EXISTS idx_raffles_draw_date ON raffles(draw_date);
CREATE INDEX IF NOT EXISTS idx_raffles_created_at ON raffles(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_raffles_updated_at 
    BEFORE UPDATE ON raffles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE raffles IS 'Tabela que armazena informações sobre as rifas do sistema';
COMMENT ON COLUMN raffles.id IS 'Identificador único da rifa';
COMMENT ON COLUMN raffles.title IS 'Título da rifa';
COMMENT ON COLUMN raffles.prize IS 'Descrição do prêmio';
COMMENT ON COLUMN raffles.prize_value IS 'Valor do prêmio em reais';
COMMENT ON COLUMN raffles.ticket_price IS 'Preço de cada bilhete em reais';
COMMENT ON COLUMN raffles.total_tickets IS 'Número total de bilhetes disponíveis';
COMMENT ON COLUMN raffles.sold_tickets IS 'Número de bilhetes vendidos';
COMMENT ON COLUMN raffles.status IS 'Status da rifa: active, paused, finished, draft';
COMMENT ON COLUMN raffles.draw_date IS 'Data e hora do sorteio';
COMMENT ON COLUMN raffles.category IS 'Categoria da rifa';
COMMENT ON COLUMN raffles.institution_name IS 'Nome da instituição organizadora';
COMMENT ON COLUMN raffles.institution_logo IS 'URL do logo da instituição';
COMMENT ON COLUMN raffles.description IS 'Descrição detalhada da rifa';
COMMENT ON COLUMN raffles.image_url IS 'URL da imagem da rifa';
COMMENT ON COLUMN raffles.revenue IS 'Receita total gerada pela rifa';
COMMENT ON COLUMN raffles.created_by IS 'ID do usuário que criou a rifa';
COMMENT ON COLUMN raffles.created_at IS 'Data e hora de criação';
COMMENT ON COLUMN raffles.updated_at IS 'Data e hora da última atualização';