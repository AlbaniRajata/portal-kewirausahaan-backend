-- Migration: Create t_penilaian_reviewer table
-- Depends on: t_distribusi_reviewer, m_tahap_penilaian

CREATE TABLE IF NOT EXISTS public.t_penilaian_reviewer (
    id_penilaian serial4 NOT NULL,
    id_distribusi int4 NOT NULL,
    id_tahap int4 NOT NULL,
    status int4 DEFAULT 0 NOT NULL,
    submitted_at timestamp NULL,
    CONSTRAINT t_penilaian_reviewer_pkey PRIMARY KEY (id_penilaian),
    CONSTRAINT uq_penilaian_reviewer_distribusi UNIQUE (id_distribusi),
    CONSTRAINT fk_penilaian_reviewer_distribusi FOREIGN KEY (id_distribusi) REFERENCES public.t_distribusi_reviewer(id_distribusi) ON DELETE CASCADE,
    CONSTRAINT fk_penilaian_reviewer_tahap FOREIGN KEY (id_tahap) REFERENCES public.m_tahap_penilaian(id_tahap)
);
