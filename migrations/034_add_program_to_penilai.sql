-- Migration: Add id_program to m_reviewer and m_juri
-- Allows linking reviewers and juris to specific programs (PMW/INBIS)
-- Existing rows will have id_program = NULL (unassigned)

ALTER TABLE m_reviewer
  ADD COLUMN IF NOT EXISTS id_program INT NULL;

ALTER TABLE m_juri
  ADD COLUMN IF NOT EXISTS id_program INT NULL;

-- Add FK constraints if program table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_reviewer_program'
      AND table_name = 'm_reviewer'
  ) THEN
    ALTER TABLE m_reviewer
      ADD CONSTRAINT fk_reviewer_program
      FOREIGN KEY (id_program) REFERENCES m_program(id_program) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_juri_program'
      AND table_name = 'm_juri'
  ) THEN
    ALTER TABLE m_juri
      ADD CONSTRAINT fk_juri_program
      FOREIGN KEY (id_program) REFERENCES m_program(id_program) ON DELETE SET NULL;
  END IF;
END $$;

-- Assign existing reviewers and juries to PMW (id_program = 1) to avoid disrupting PMW
UPDATE m_reviewer SET id_program = 1 WHERE id_program IS NULL;
UPDATE m_juri SET id_program = 1 WHERE id_program IS NULL;
