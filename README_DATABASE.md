# Configuração do Banco de Dados - Supabase

Este documento explica como configurar as tabelas necessárias no Supabase para o sistema de rifas.

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Projeto criado no Supabase
3. Acesso ao SQL Editor do Supabase

## 🚀 Configuração Rápida

### Opção 1: Setup Completo (Recomendado)

Execute o arquivo `sql/setup_database.sql` no SQL Editor do Supabase. Este arquivo contém:

- Todas as tabelas necessárias
- Índices para performance
- Triggers automáticos
- Funções de negócio
- Comentários de documentação

```sql
-- Copie e cole o conteúdo de sql/setup_database.sql no SQL Editor
```

### 👤 Configuração do Usuário Administrador

Após criar as tabelas, configure um usuário administrador:

1. **Opção Rápida**: Execute `sql/configure_admin.sql`
2. **Opção Detalhada**: Execute `sql/04_setup_admin_user.sql`

**Passos:**
1. Abra o arquivo `sql/configure_admin.sql`
2. Substitua os dados de exemplo pelos seus dados reais
3. Execute o script no SQL Editor do Supabase
4. Verifique se o usuário admin foi criado corretamente

```sql
-- Exemplo de verificação
SELECT name, email, role FROM users WHERE role = 'admin';
```

### Opção 2: Setup Individual

Se preferir executar os scripts separadamente:

1. **Tabela de Rifas**: `sql/01_create_raffles_table.sql`
2. **Tabela de Bilhetes**: `sql/02_create_tickets_table.sql`
3. **Tabela de Depoimentos**: `sql/03_create_testimonials_table.sql`

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