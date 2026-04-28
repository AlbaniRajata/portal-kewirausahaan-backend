-- Migration: Create t_peserta_program table
-- Depends on: m_mahasiswa, m_program, t_tim

CREATE TABLE IF NOT EXISTS public.t_peserta_program (
    id_user int4 NOT NULL,
    id_program int4 NOT NULL,
    tahun int4 NOT NULL,
    status_lolos int4 DEFAULT 0 NULL,
    id_tim int4 NOT NULL,
    created_at timestamp DEFAULT now() NULL,
    status_peserta int4 DEFAULT 1 NULL,
    CONSTRAINT t_peserta_program_pkey PRIMARY KEY (id_user, id_program),
    CONSTRAINT fk_peserta_tim FOREIGN KEY (id_tim) REFERENCES public.t_tim(id_tim) ON DELETE CASCADE,
    CONSTRAINT t_peserta_program_id_program_fkey FOREIGN KEY (id_program) REFERENCES public.m_program(id_program) ON DELETE CASCADE,
    CONSTRAINT t_peserta_program_id_user_fkey FOREIGN KEY (id_user) REFERENCES public.m_mahasiswa(id_user) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_peserta_tim_program ON public.t_peserta_program USING btree (id_tim, id_program, id_user);
