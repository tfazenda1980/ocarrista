# Loja do Carrista

Artigos em `products.json`. Cada produto precisa de um **`id` único** (ex. `coin-gcc`).

Ao adicionar um artigo novo e fazer deploy:

1. O cron diário (`/api/cron/notifications`) envia email a **todos os membros aprovados**.
2. Só artigos cujo `id` ainda não está em `notification_sent` (tabela Neon) disparam alerta.

Artigos já existentes foram marcados em `scripts/migrate-notifications.sql`.
