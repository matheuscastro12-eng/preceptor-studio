-- ═══════════════════════════════════════════════════════════════════════════
-- PRECEPTOR STUDIO - Database Schema
-- Cole este SQL no SQL Editor do Supabase para criar todas as tabelas
-- ═══════════════════════════════════════════════════════════════════════════

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

-- Tabela de estudos
CREATE TABLE IF NOT EXISTS studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('saude', 'educacao', 'juridico', 'tech', 'outro')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'questionnaire', 'generating', 'completed', 'archived')),
  answers JSONB DEFAULT '{}'::jsonb,
  output_md TEXT,
  output_html TEXT,
  generation_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_studies_client_id ON studies(client_id);
CREATE INDEX IF NOT EXISTS idx_studies_category ON studies(category);
CREATE INDEX IF NOT EXISTS idx_studies_status ON studies(status);
CREATE INDEX IF NOT EXISTS idx_studies_created_at ON studies(created_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_studies_updated_at
  BEFORE UPDATE ON studies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (habilitar quando publicar)
-- ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE studies ENABLE ROW LEVEL SECURITY;
