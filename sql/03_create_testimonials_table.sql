-- Criação da tabela testimonials
-- Esta tabela armazena depoimentos de ganhadores e participantes das rifas

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  raffle_id UUID REFERENCES raffles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  type VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'winner', 'participant')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  winning_number VARCHAR(10),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criação da tabela users (se não existir) para referência
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

-- Adicionar foreign key para user_id após criar a tabela users
ALTER TABLE testimonials 
ADD CONSTRAINT fk_testimonials_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Adicionar foreign key para approved_by
ALTER TABLE testimonials 
ADD CONSTRAINT fk_testimonials_approved_by 
FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON testimonials(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_raffle_id ON testimonials(raffle_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_type ON testimonials(type);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at);

-- Índices para a tabela users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Trigger para atualizar updated_at automaticamente nas duas tabelas
CREATE TRIGGER update_testimonials_updated_at 
    BEFORE UPDATE ON testimonials 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para aprovar depoimento automaticamente
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

-- Comentários para documentação
COMMENT ON TABLE testimonials IS 'Tabela que armazena depoimentos de usuários sobre as rifas';
COMMENT ON COLUMN testimonials.id IS 'Identificador único do depoimento';
COMMENT ON COLUMN testimonials.user_id IS 'ID do usuário que fez o depoimento';
COMMENT ON COLUMN testimonials.raffle_id IS 'ID da rifa relacionada ao depoimento';
COMMENT ON COLUMN testimonials.content IS 'Conteúdo do depoimento';
COMMENT ON COLUMN testimonials.rating IS 'Avaliação de 1 a 5 estrelas';
COMMENT ON COLUMN testimonials.type IS 'Tipo do depoimento: general, winner, participant';
COMMENT ON COLUMN testimonials.status IS 'Status de moderação: pending, approved, rejected';
COMMENT ON COLUMN testimonials.winning_number IS 'Número sorteado (para ganhadores)';
COMMENT ON COLUMN testimonials.approved_by IS 'ID do moderador que aprovou/rejeitou';
COMMENT ON COLUMN testimonials.approved_at IS 'Data e hora da aprovação/rejeição';

COMMENT ON TABLE users IS 'Tabela que armazena informações dos usuários do sistema';
COMMENT ON COLUMN users.id IS 'Identificador único do usuário';
COMMENT ON COLUMN users.name IS 'Nome completo do usuário';
COMMENT ON COLUMN users.email IS 'Email do usuário (único)';
COMMENT ON COLUMN users.phone IS 'Telefone do usuário';
COMMENT ON COLUMN users.avatar_url IS 'URL do avatar do usuário';
COMMENT ON COLUMN users.role IS 'Papel do usuário: user, admin, moderator';
COMMENT ON COLUMN users.status IS 'Status da conta: active, inactive, banned';
COMMENT ON COLUMN users.email_verified IS 'Se o email foi verificado';