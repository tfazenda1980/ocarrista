-- Executar no Neon se a tabela members já existia antes desta funcionalidade
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS gesco_access BOOLEAN NOT NULL DEFAULT FALSE;
