-- Migration: Create t_admin_program table
-- Depends on: m_user, m_program

CREATE TABLE IF NOT EXISTS public.t_admin_program (
    id_user int4 NOT NULL,
    id_program int4 NOT NULL,
    is_active bool DEFAULT true NULL,
    CONSTRAINT t_admin_program_pkey PRIMARY KEY (id_user, id_program),
    CONSTRAINT t_admin_program_id_program_fkey FOREIGN KEY (id_program) REFERENCES public.m_program(id_program) ON DELETE CASCADE,
    CONSTRAINT t_admin_program_id_user_fkey FOREIGN KEY (id_user) REFERENCES public.m_user(id_user) ON DELETE CASCADE
);
