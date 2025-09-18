-- Promover usuário atual para admin
UPDATE users SET role = 'admin' WHERE email = 'admin@rifou.net.br';