-- Migration: Create t_anggota_tim table
-- Depends on: t_tim, m_mahasiswa

CREATE TABLE IF NOT EXISTS public.t_anggota_tim (
    id_tim int4 NOT NULL,
    id_user int4 NOT NULL,
    peran int4 NOT NULL,
    status int4 DEFAULT 0 NULL,
    catatan text NULL,
    CONSTRAINT t_anggota_tim_pkey PRIMARY KEY (id_tim, id_user),
    CONSTRAINT t_anggota_tim_id_tim_fkey FOREIGN KEY (id_tim) REFERENCES public.t_tim(id_tim) ON DELETE CASCADE,
    CONSTRAINT t_anggota_tim_id_user_fkey FOREIGN KEY (id_user) REFERENCES public.m_mahasiswa(id_user) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS one_ketua_per_tim ON public.t_anggota_tim USING btree (id_tim) WHERE (peran = 1);
