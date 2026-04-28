-- Migration: Create t_bimbingan table
-- Depends on: t_tim, t_proposal, m_dosen, m_mahasiswa

CREATE TABLE IF NOT EXISTS public.t_bimbingan (
    id_bimbingan int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
    id_tim int4 NOT NULL,
    id_proposal int4 NULL,
    id_dosen int4 NOT NULL,
    diajukan_oleh int4 NOT NULL,
    tanggal_bimbingan timestamp NOT NULL,
    metode int4 NOT NULL,
    topik varchar(200) NOT NULL,
    deskripsi text NULL,
    status int4 DEFAULT 0 NOT NULL,
    catatan_dosen text NULL,
    created_at timestamp DEFAULT now() NULL,
    responded_at timestamp NULL,
    CONSTRAINT t_bimbingan_pkey PRIMARY KEY (id_bimbingan),
    CONSTRAINT fk_bimbingan_dosen FOREIGN KEY (id_dosen) REFERENCES public.m_dosen(id_user) ON DELETE CASCADE,
    CONSTRAINT fk_bimbingan_pengaju FOREIGN KEY (diajukan_oleh) REFERENCES public.m_mahasiswa(id_user) ON DELETE CASCADE,
    CONSTRAINT fk_bimbingan_proposal FOREIGN KEY (id_proposal) REFERENCES public.t_proposal(id_proposal) ON DELETE CASCADE,
    CONSTRAINT fk_bimbingan_tim FOREIGN KEY (id_tim) REFERENCES public.t_tim(id_tim) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bimbingan_dosen ON public.t_bimbingan USING btree (id_dosen);
CREATE INDEX IF NOT EXISTS idx_bimbingan_status ON public.t_bimbingan USING btree (status);
CREATE INDEX IF NOT EXISTS idx_bimbingan_tim ON public.t_bimbingan USING btree (id_tim);
CREATE UNIQUE INDEX IF NOT EXISTS one_pending_bimbingan_per_tim ON public.t_bimbingan USING btree (id_tim) WHERE (status = 0);
