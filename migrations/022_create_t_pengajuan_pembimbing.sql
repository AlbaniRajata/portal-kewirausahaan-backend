-- Migration: Create t_pengajuan_pembimbing table
-- Depends on: t_tim, m_program, m_dosen, m_mahasiswa

CREATE TABLE IF NOT EXISTS public.t_pengajuan_pembimbing (
    id_pengajuan serial4 NOT NULL,
    id_tim int4 NOT NULL,
    id_program int4 NOT NULL,
    id_dosen int4 NOT NULL,
    diajukan_oleh int4 NOT NULL,
    status int4 DEFAULT 0 NULL,
    catatan_dosen text NULL,
    created_at timestamp DEFAULT now() NULL,
    responded_at timestamp NULL,
    CONSTRAINT t_pengajuan_pembimbing_pkey PRIMARY KEY (id_pengajuan),
    CONSTRAINT unique_tim_pengajuan UNIQUE (id_tim, id_program),
    CONSTRAINT uq_pengajuan_pembimbing_id_tim UNIQUE (id_tim),
    CONSTRAINT fk_pengajuan_dosen FOREIGN KEY (id_dosen) REFERENCES public.m_dosen(id_user) ON DELETE CASCADE,
    CONSTRAINT fk_pengajuan_mahasiswa FOREIGN KEY (diajukan_oleh) REFERENCES public.m_mahasiswa(id_user) ON DELETE CASCADE,
    CONSTRAINT fk_pengajuan_program FOREIGN KEY (id_program) REFERENCES public.m_program(id_program) ON DELETE CASCADE,
    CONSTRAINT fk_pengajuan_tim FOREIGN KEY (id_tim) REFERENCES public.t_tim(id_tim) ON DELETE CASCADE
);
