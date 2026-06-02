-- Executar no Neon após init-db.sql

CREATE TABLE IF NOT EXISTS notification_sent (
  kind TEXT NOT NULL,
  reference TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (kind, reference)
);

-- Evitar email em massa dos artigos já existentes na Loja (só alertar novos após esta migração)
INSERT INTO notification_sent (kind, reference) VALUES
  ('loja_product', 'coin-gcc'),
  ('loja_product', 'coin-erec'),
  ('loja_product', 'galhardete-qcav'),
  ('loja_product', 'galhardete-erec'),
  ('loja_product', 'velcro-gcc'),
  ('loja_product', 'velcro-erec'),
  ('loja_product', 'gravata-qcav'),
  ('loja_product', 'cracha-qcav'),
  ('loja_product', 'caderno-gcc'),
  ('loja_product', 'cc-farda')
ON CONFLICT (kind, reference) DO NOTHING;
