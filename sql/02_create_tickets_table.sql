-- Criação da tabela tickets
-- Esta tabela armazena informações sobre os bilhetes de cada rifa

CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  buyer_name VARCHAR(255),
  buyer_email VARCHAR(255),
  buyer_phone VARCHAR(20),
  purchase_date TIMESTAMP WITH TIME ZONE,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method VARCHAR(50),
  payment_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para garantir que cada número seja único por rifa
  UNIQUE(raffle_id, number)
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_tickets_raffle_id ON tickets(raffle_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON tickets(number);
CREATE INDEX IF NOT EXISTS idx_tickets_buyer_email ON tickets(buyer_email);
CREATE INDEX IF NOT EXISTS idx_tickets_payment_status ON tickets(payment_status);
CREATE INDEX IF NOT EXISTS idx_tickets_purchase_date ON tickets(purchase_date);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_tickets_updated_at 
    BEFORE UPDATE ON tickets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar sold_tickets na tabela raffles automaticamente
CREATE OR REPLACE FUNCTION update_raffle_sold_tickets()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualiza o contador de bilhetes vendidos na rifa
    UPDATE raffles 
    SET sold_tickets = (
        SELECT COUNT(*) 
        FROM tickets 
        WHERE raffle_id = COALESCE(NEW.raffle_id, OLD.raffle_id) 
        AND status = 'sold'
    ),
    revenue = (
        SELECT COUNT(*) * ticket_price
        FROM tickets t
        JOIN raffles r ON r.id = t.raffle_id
        WHERE t.raffle_id = COALESCE(NEW.raffle_id, OLD.raffle_id) 
        AND t.status = 'sold'
    )
    WHERE id = COALESCE(NEW.raffle_id, OLD.raffle_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers para manter sold_tickets atualizado
CREATE TRIGGER update_raffle_sold_tickets_insert
    AFTER INSERT ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_raffle_sold_tickets();

CREATE TRIGGER update_raffle_sold_tickets_update
    AFTER UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_raffle_sold_tickets();

CREATE TRIGGER update_raffle_sold_tickets_delete
    AFTER DELETE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_raffle_sold_tickets();

-- Comentários para documentação
COMMENT ON TABLE tickets IS 'Tabela que armazena informações sobre os bilhetes das rifas';
COMMENT ON COLUMN tickets.id IS 'Identificador único do bilhete';
COMMENT ON COLUMN tickets.raffle_id IS 'ID da rifa à qual o bilhete pertence';
COMMENT ON COLUMN tickets.number IS 'Número do bilhete';
COMMENT ON COLUMN tickets.status IS 'Status do bilhete: available, reserved, sold';
COMMENT ON COLUMN tickets.buyer_name IS 'Nome do comprador';
COMMENT ON COLUMN tickets.buyer_email IS 'Email do comprador';
COMMENT ON COLUMN tickets.buyer_phone IS 'Telefone do comprador';
COMMENT ON COLUMN tickets.purchase_date IS 'Data e hora da compra';
COMMENT ON COLUMN tickets.payment_status IS 'Status do pagamento';
COMMENT ON COLUMN tickets.payment_method IS 'Método de pagamento utilizado';
COMMENT ON COLUMN tickets.payment_id IS 'ID da transação de pagamento';
COMMENT ON COLUMN tickets.created_at IS 'Data e hora de criação';
COMMENT ON COLUMN tickets.updated_at IS 'Data e hora da última atualização';