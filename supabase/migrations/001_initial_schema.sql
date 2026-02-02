-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers table (extends Supabase auth.users)
CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'part-time', 'full-time', 'team')),
  storage_used_bytes BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Files table
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('sldprt', 'sldasm', 'slddrw', 'step', 'pdf')),
  size_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  storage_version_id TEXT, -- R2 version ID for rollback
  version INTEGER DEFAULT 1,
  parent_version_id UUID REFERENCES files(id),
  checksum TEXT, -- SHA256 for integrity
  metadata JSONB DEFAULT '{}', -- bounding box, mass, etc
  expires_at TIMESTAMPTZ, -- NULL for permanent (paid tiers)
  created_by UUID NOT NULL REFERENCES customers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- File versions history
CREATE TABLE file_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  storage_version_id TEXT,
  size_bytes BIGINT NOT NULL,
  checksum TEXT,
  change_summary TEXT,
  created_by UUID NOT NULL REFERENCES customers(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- File relationships (assemblies to parts)
CREATE TABLE file_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  child_file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  version_id UUID REFERENCES file_versions(id),
  quantity INTEGER DEFAULT 1,
  reference_designators TEXT[],
  transform_matrix JSONB, -- position/rotation in assembly
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_file_id, child_file_id)
);

-- Indexes
CREATE INDEX idx_files_project ON files(project_id);
CREATE INDEX idx_files_expires ON files(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_file_versions_file ON file_versions(file_id);
CREATE INDEX idx_file_relationships_parent ON file_relationships(parent_file_id);
CREATE INDEX idx_file_relationships_child ON file_relationships(child_file_id);

-- Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own customer data"
  ON customers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own customer data"
  ON customers FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (customer_id = auth.uid());

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (customer_id = auth.uid());

CREATE POLICY "Users can view files in own projects"
  ON files FOR SELECT
  USING (project_id IN (
    SELECT id FROM projects WHERE customer_id = auth.uid()
  ));

CREATE POLICY "Users can create files in own projects"
  ON files FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own files"
  ON files FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete own files"
  ON files FOR DELETE
  USING (created_by = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-delete expired files (free tier cleanup)
CREATE OR REPLACE FUNCTION delete_expired_files()
RETURNS void AS $$
BEGIN
  DELETE FROM files WHERE expires_at < NOW();
END;
$$ language 'plpgsql';