-- Setup completo do banco de dados para o sistema de rifas
-- Execute este arquivo no Supabase SQL Editor para criar todas as tabelas necessárias

-- ============================================================================
-- CONFIGURAÇÕES INICIAIS
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- TABELA USERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Trigger para users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABELA RAFFLES
-- ============================================================================

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
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para raffles
CREATE INDEX IF NOT EXISTS idx_raffles_status ON raffles(status);
CREATE INDEX IF NOT EXISTS idx_raffles_category ON raffles(category);
CREATE INDEX IF NOT EXISTS idx_raffles_created_by ON raffles(created_by);
CREATE INDEX IF NOT EXISTS idx_raffles_draw_date ON raffles(draw_date);
CREATE INDEX IF NOT EXISTS idx_raffles_created_at ON raffles(created_at);

-- Trigger para raffles
CREATE TRIGGER update_raffles_updated_at 
    BEFORE UPDATE ON raffles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABELA TICKETS
-- ============================================================================

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

-- Índices para tickets
CREATE INDEX IF NOT EXISTS idx_tickets_raffle_id ON tickets(raffle_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON tickets(number);
CREATE INDEX IF NOT EXISTS idx_tickets_buyer_email ON tickets(buyer_email);
CREATE INDEX IF NOT EXISTS idx_tickets_payment_status ON tickets(payment_status);
CREATE INDEX IF NOT EXISTS idx_tickets_purchase_date ON tickets(purchase_date);

-- Trigger para tickets
CREATE TRIGGER update_tickets_updated_at 
    BEFORE UPDATE ON tickets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABELA TESTIMONIALS
-- ============================================================================

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  raffle_id UUID REFERENCES raffles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  type VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'winner', 'participant')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  winning_number VARCHAR(10),
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON testimonials(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_raffle_id ON testimonials(raffle_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_type ON testimonials(type);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at);

-- Trigger para testimonials
CREATE TRIGGER update_testimonials_updated_at 
    BEFORE UPDATE ON testimonials 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNÇÕES DE NEGÓCIO
-- ============================================================================

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

-- Função para aprovar depoimento
CREATE OR REPLACE FUNCTION approve_testimonial(testimonial_id UUID, approver_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE testimonials 
    SET status = 'approved',
        approved_by = approver_id,
        approved_at = NOW()
    WHERE id = testimonial_id;
    
    RETURN FOUND;
END;
$$ language 'plpgsql';

-- Função para rejeitar depoimento
CREATE OR REPLACE FUNCTION reject_testimonial(testimonial_id UUID, approver_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE testimonials 
    SET status = 'rejected',
        approved_by = approver_id,
        approved_at = NOW()
    WHERE id = testimonial_id;
    
    RETURN FOUND;
END;
$$ language 'plpgsql';

-- ============================================================================
-- POLÍTICAS RLS (Row Level Security) - OPCIONAL
-- ============================================================================

-- Habilitar RLS nas tabelas (descomente se necessário)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Exemplo de políticas (descomente e ajuste conforme necessário)
-- CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================================================

-- Inserir usuário administrador padrão (descomente se necessário)
-- INSERT INTO users (name, email, role, email_verified) 
-- VALUES ('Administrador', 'admin@rifadash.com', 'admin', true)
-- ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE users IS 'Tabela que armazena informações dos usuários do sistema';
COMMENT ON TABLE raffles IS 'Tabela que armazena informações sobre as rifas do sistema';
COMMENT ON TABLE tickets IS 'Tabela que armazena informações sobre os bilhetes das rifas';
COMMENT ON TABLE testimonials IS 'Tabela que armazena depoimentos de usuários sobre as rifas';

-- ============================================================================
-- FIM DO SETUP
-- ============================================================================

-- Verificar se todas as tabelas foram criadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'raffles', 'tickets', 'testimonials')
ORDER BY tablename;