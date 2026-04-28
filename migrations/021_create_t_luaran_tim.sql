-- Migration: Create t_luaran_tim table
-- Depends on: t_tim, m_luaran, m_user

CREATE TABLE IF NOT EXISTS public.t_luaran_tim (
    id_luaran_tim int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
    id_tim int4 NOT NULL,
    id_luaran int4 NOT NULL,
    file_luaran varchar(255) NULL,
    link_luaran jsonb NULL,
    status int4 DEFAULT 0 NOT NULL,
    catatan_admin text NULL,
    submitted_at timestamp NULL,
    reviewed_at timestamp NULL,
    reviewed_by int4 NULL,
    CONSTRAINT t_luaran_tim_pkey PRIMARY KEY (id_luaran_tim),
    CONSTRAINT t_luaran_tim_unique UNIQUE (id_tim, id_luaran),
    CONSTRAINT t_luaran_tim_id_luaran_fkey FOREIGN KEY (id_luaran) REFERENCES public.m_luaran(id_luaran) ON DELETE CASCADE,
    CONSTRAINT t_luaran_tim_id_tim_fkey FOREIGN KEY (id_tim) REFERENCES public.t_tim(id_tim) ON DELETE CASCADE,
    CONSTRAINT t_luaran_tim_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.m_user(id_user) ON DELETE SET NULL
);
