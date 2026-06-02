-- Migration: Drop unique index that blocks multiple active reviewer assignments
-- Reason: tahap 1 needs two active reviewers per proposal

DROP INDEX IF EXISTS public.uq_distribusi_reviewer_aktif;
