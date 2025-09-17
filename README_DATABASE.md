# Configuração do Banco de Dados - Sistema de Rifas

Este documento contém todas as instruções para configurar o banco de dados PostgreSQL no Supabase para o sistema de rifas.

## 📋 Estrutura do Banco de Dados

### Tabelas Principais

1. **users** - Gerenciamento de usuários
2. **raffles** - Rifas disponíveis
3. **tickets** - Bilhetes comprados
4. **testimonials** - Depoimentos dos usuários

## 🚀 Configuração Inicial

### 1. Executar Scripts na Ordem

Execute os scripts SQL na seguinte ordem no editor SQL do Supabase:

```sql
-- 1. Configuração inicial das tabelas
\i sql/setup_database.sql

-- 2. Criar tabela de rifas
\i sql/01_create_raffles_table.sql

-- 3. Criar tabela de bilhetes
\i sql/02_create_tickets_table.sql

-- 4. Criar tabela de depoimentos
\i sql/03_create_testimonials_table.sql

-- 5. Configurar usuário administrador
\i sql/04_setup_admin_user.sql

-- 6. CONFIGURAR SEGURANÇA (IMPORTANTE!)
\i sql/setup_security.sql
```

### 2. Configurar Administrador

Após executar os scripts, configure um usuário administrador:

```sql
-- Execute o script de configuração do admin
\i sql/configure_admin.sql
```

## 🔒 Configuração de Segurança (RLS)

### Scripts de Segurança Disponíveis

O sistema inclui configuração completa de Row Level Security (RLS):

- `sql/05_security_raffles.sql` - Políticas para tabela raffles
- `sql/06_security_tickets.sql` - Políticas para tabela tickets  
- `sql/07_security_users.sql` - Políticas para tabela users
- `sql/08_security_testimonials.sql` - Políticas para tabela testimonials
- `sql/setup_security.sql` - **Script consolidado (RECOMENDADO)**

### Execução Rápida de Segurança

Para aplicar todas as configurações de segurança de uma vez:

```sql
-- Execute APENAS este script para configurar toda a segurança
\i sql/setup_security.sql
```

### Políticas de Acesso Implementadas

#### 🎫 Tabela Raffles
- **Leitura**: Todos podem ver rifas ativas/concluídas
- **Leitura Admin**: Admins veem todas as rifas
- **Inserção**: Apenas admins podem criar rifas
- **Atualização**: Apenas admins podem modificar rifas
- **Exclusão**: Apenas admins podem deletar rifas

#### 🎟️ Tabela Tickets
- **Leitura**: Usuários veem seus bilhetes, admins veem todos
- **Leitura Pública**: Estatísticas gerais são públicas
- **Inserção**: Usuários podem comprar bilhetes de rifas ativas
- **Atualização**: Usuários editam seus bilhetes, admins editam todos
- **Exclusão**: Usuários cancelam seus bilhetes, admins deletam todos

#### 👥 Tabela Users
- **Leitura**: Usuários veem seu perfil, admins veem todos
- **Leitura Pública**: Informações básicas são públicas
- **Inserção**: Criação automática de perfil + admins criam qualquer
- **Atualização**: Usuários editam seu perfil (exceto role)
- **Exclusão**: Usuários deletam seu perfil, admins deletam não-admins

#### 💬 Tabela Testimonials
- **Leitura**: Depoimentos aprovados são públicos
- **Leitura Privada**: Usuários veem seus depoimentos
- **Inserção**: Usuários criam depoimentos (moderação automática)
- **Atualização**: Usuários editam pendentes, admins moderam
- **Exclusão**: Usuários deletam pendentes, admins deletam todos

### Recursos de Segurança Adicionais

#### 🔧 Funções Auxiliares
- `is_admin()` - Verifica se usuário é administrador
- `handle_new_user()` - Cria perfil automaticamente
- `auto_moderate_testimonial()` - Moderação automática de depoimentos

#### 👁️ Views Públicas
- `public_ticket_stats` - Estatísticas de bilhetes por rifa
- `public_user_info` - Informações básicas dos usuários
- `public_testimonials` - Depoimentos aprovados com dados do usuário

#### ⚡ Triggers Automáticos
- Criação automática de perfil de usuário
- Moderação automática de depoimentos (aprovação para rating ≥4)
- Timestamps automáticos

## 📊 Estrutura das Tabelas

### 🎫 Tabela `raffles`
Armazena informações sobre as rifas:
- `id`: Identificador único (UUID)
- `title`: Título da rifa
- `prize`: Descrição do prêmio
- `prize_value`: Valor do prêmio em reais
- `ticket_price`: Preço de cada bilhete
- `total_tickets`: Número total de bilhetes
- `sold_tickets`: Bilhetes vendidos (atualizado automaticamente)
- `status`: Status da rifa (draft, active, paused, finished)
- `draw_date`: Data do sorteio
- `category`: Categoria da rifa
- `revenue`: Receita total (calculada automaticamente)
- `created_by`: ID do usuário criador

### 🎟️ Tabela `tickets`
Armazena informações sobre os bilhetes:
- `id`: Identificador único (UUID)
- `raffle_id`: Referência à rifa
- `number`: Número do bilhete
- `status`: Status (available, reserved, sold)
- `buyer_name`: Nome do comprador
- `buyer_email`: Email do comprador
- `payment_status`: Status do pagamento

### 👥 Tabela `users`
Armazena informações dos usuários:
- `id`: Identificador único (UUID)
- `name`: Nome completo
- `email`: Email (único)
- `role`: Papel (user, admin, moderator)
- `status`: Status da conta (active, inactive, banned)

### 💬 Tabela `testimonials`
Armazena depoimentos dos usuários:
- `id`: Identificador único (UUID)
- `user_id`: Referência ao usuário
- `raffle_id`: Referência à rifa
- `content`: Conteúdo do depoimento
- `rating`: Avaliação (1-5 estrelas)
- `status`: Status de moderação (pending, approved, rejected)

## ⚙️ Funcionalidades Automáticas

### 🔄 Triggers Implementados

1. **Atualização de `updated_at`**: Todas as tabelas têm o campo `updated_at` atualizado automaticamente
2. **Contagem de bilhetes vendidos**: A coluna `sold_tickets` na tabela `raffles` é atualizada automaticamente quando bilhetes são vendidos
3. **Cálculo de receita**: A coluna `revenue` é calculada automaticamente baseada nos bilhetes vendidos

### 🛠️ Funções Disponíveis

- `approve_testimonial(testimonial_id, approver_id)`: Aprova um depoimento
- `reject_testimonial(testimonial_id, approver_id)`: Rejeita um depoimento

## 🔧 Configuração da Aplicação

Após criar as tabelas, atualize o arquivo `src/lib/config.ts`:

```typescript
export const config = {
  isDevelopment: false, // Mude para false para usar o Supabase
  // ... outras configurações
}
```

## 🔐 Segurança (Opcional)

O arquivo de setup inclui comentários para habilitar Row Level Security (RLS) se necessário. Descomente as seções relevantes para implementar políticas de segurança.

## ✅ Verificação

Após executar o setup, você pode verificar se tudo foi criado corretamente executando:

```sql
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'raffles', 'tickets', 'testimonials')
ORDER BY tablename;
```

## 🆘 Solução de Problemas

### Erro de Permissão
Se encontrar erros de permissão, certifique-se de estar executando os comandos como proprietário do banco ou com privilégios adequados.

### Tabelas já existem
Se as tabelas já existirem, os comandos `CREATE TABLE IF NOT EXISTS` não causarão erro.

### Dados de teste
Para popular com dados de teste, você pode usar os dados mock já disponíveis na aplicação ou criar seus próprios dados.

## 📞 Suporte

Se encontrar problemas durante a configuração:

1. Verifique os logs do Supabase
2. Confirme que todas as extensões necessárias estão habilitadas
3. Verifique se não há conflitos de nomes de tabelas existentes

---

**Nota**: Após configurar o banco de dados, lembre-se de atualizar as variáveis de ambiente e configurações da aplicação para apontar para o Supabase em produção.