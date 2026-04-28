-- Migration: Create t_distribusi_reviewer table
-- Depends on: t_proposal, m_reviewer, m_tahap_penilaian, m_user

CREATE TABLE IF NOT EXISTS public.t_distribusi_reviewer (
    id_distribusi int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
    id_proposal int4 NOT NULL,
    id_reviewer int4 NOT NULL,
    tahap int4 NOT NULL,
    status int4 DEFAULT 0 NULL,
    assigned_at timestamp DEFAULT now() NULL,
    assigned_by int4 NOT NULL,
    catatan_reviewer text NULL,
    responded_at timestamp NULL,
    CONSTRAINT t_distribusi_reviewer_pkey PRIMARY KEY (id_distribusi),
    CONSTRAINT uq_distribusi UNIQUE (id_proposal, id_reviewer, tahap),
    CONSTRAINT fk_dist_admin FOREIGN KEY (assigned_by) REFERENCES public.m_user(id_user),
    CONSTRAINT fk_dist_proposal FOREIGN KEY (id_proposal) REFERENCES public.t_proposal(id_proposal) ON DELETE CASCADE,
    CONSTRAINT fk_dist_reviewer FOREIGN KEY (id_reviewer) REFERENCES public.m_reviewer(id_user) ON DELETE CASCADE,
    CONSTRAINT fk_dist_tahap FOREIGN KEY (tahap) REFERENCES public.m_tahap_penilaian(id_tahap)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_distribusi_reviewer_aktif ON public.t_distribusi_reviewer USING btree (id_proposal, tahap) WHERE (status <> ALL (ARRAY[2, 5]));
