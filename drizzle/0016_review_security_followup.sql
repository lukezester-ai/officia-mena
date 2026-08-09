CREATE UNIQUE INDEX IF NOT EXISTS journal_entries_tenant_source_unique
  ON journal_entries (tenant_id, source_type, source_id)
  WHERE source_type IS NOT NULL AND source_id IS NOT NULL;
