-- Executar no Neon se já correu migrate-notifications.sql com ids antigos.
-- Marca o catálogo actual com imagens como já notificado (evita emails em massa).

INSERT INTO notification_sent (kind, reference) VALUES
  ('loja_product', 'galhardete-qcav'),
  ('loja_product', 'gravata-qcav'),
  ('loja_product', 'cracha-qcav'),
  ('loja_product', 'caderno-gcc'),
  ('loja_product', 'cc-farda')
ON CONFLICT (kind, reference) DO NOTHING;
