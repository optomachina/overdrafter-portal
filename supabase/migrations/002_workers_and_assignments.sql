-- Workers table (extends customers for CAD designers)
CREATE TABLE workers (
  id UUID PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE,
  bio TEXT,
  skills TEXT[], -- ['optics', 'sheet_metal', 'fea', 'gd&t']
  hourly_rate DECIMAL(10, 2),
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  max_projects INTEGER DEFAULT 3,
  rating DECIMAL(2, 1) DEFAULT 5.0,
  total_projects_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project assignments
CREATE TABLE project_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES customers(id), -- admin who assigned
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'review', 'completed', 'cancelled')),
  estimated_hours INTEGER,
  actual_hours INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, worker_id)
);

-- Time tracking
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES project_assignments(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project comments (customer ↔ worker communication)
CREATE TABLE project_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- true = worker only, false = customer visible
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_workers_availability ON workers(availability_status);
CREATE INDEX idx_project_assignments_worker ON project_assignments(worker_id);
CREATE INDEX idx_project_assignments_project ON project_assignments(project_id);
CREATE INDEX idx_project_assignments_status ON project_assignments(status);
CREATE INDEX idx_time_entries_assignment ON time_entries(assignment_id);
CREATE INDEX idx_project_comments_project ON project_comments(project_id);

-- RLS Policies
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

-- Workers can view own profile
CREATE POLICY "Workers can view own profile"
  ON workers FOR SELECT
  USING (id = auth.uid());

-- Admins can view all workers
CREATE POLICY "Admins can view all workers"
  ON workers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM customers WHERE id = auth.uid() AND tier = 'admin'
  ));

-- Workers can update own profile
CREATE POLICY "Workers can update own profile"
  ON workers FOR UPDATE
  USING (id = auth.uid());

-- Workers can view own assignments
CREATE POLICY "Workers can view own assignments"
  ON project_assignments FOR SELECT
  USING (worker_id = auth.uid());

-- Customers can view assignments for their projects
CREATE POLICY "Customers can view project assignments"
  ON project_assignments FOR SELECT
  USING (project_id IN (
    SELECT id FROM projects WHERE customer_id = auth.uid()
  ));

-- Admins can manage all assignments
CREATE POLICY "Admins can manage assignments"
  ON project_assignments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM customers WHERE id = auth.uid() AND tier = 'admin'
  ));

-- Workers can create time entries
CREATE POLICY "Workers can create time entries"
  ON time_entries FOR INSERT
  WITH CHECK (worker_id = auth.uid());

-- Workers can view own time entries
CREATE POLICY "Workers can view own time entries"
  ON time_entries FOR SELECT
  USING (worker_id = auth.uid());

-- Comments visible to project participants
CREATE POLICY "Comments visible to project participants"
  ON project_comments FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE customer_id = auth.uid()
    ) OR
    project_id IN (
      SELECT project_id FROM project_assignments WHERE worker_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM customers WHERE id = auth.uid() AND tier = 'admin'
    )
  );

-- Project participants can create comments
CREATE POLICY "Project participants can create comments"
  ON project_comments FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE customer_id = auth.uid()
    ) OR
    project_id IN (
      SELECT project_id FROM project_assignments WHERE worker_id = auth.uid()
    )
  );

-- Update triggers
CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_assignments_updated_at BEFORE UPDATE ON project_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();