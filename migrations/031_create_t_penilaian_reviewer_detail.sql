-- Migration: Create t_penilaian_reviewer_detail table
-- Depends on: t_penilaian_reviewer, m_kriteria_penilaian

CREATE TABLE IF NOT EXISTS public.t_penilaian_reviewer_detail (
    id_detail serial4 NOT NULL,
    id_penilaian int4 NOT NULL,
    id_kriteria int4 NOT NULL,
    skor int4 NOT NULL,
    nilai int4 NOT NULL,
    catatan text NULL,
    created_at timestamp DEFAULT now() NULL,
    updated_at timestamp DEFAULT now() NULL,
    CONSTRAINT skor_check CHECK ((skor = ANY (ARRAY[1, 2, 3, 5, 6, 7]))),
    CONSTRAINT t_penilaian_reviewer_detail_pkey PRIMARY KEY (id_detail),
    CONSTRAINT uq_penilaian_reviewer_kriteria UNIQUE (id_penilaian, id_kriteria),
    CONSTRAINT fk_pd_penilaian_reviewer FOREIGN KEY (id_penilaian) REFERENCES public.t_penilaian_reviewer(id_penilaian) ON DELETE CASCADE,
    CONSTRAINT fk_pd_reviewer_kriteria FOREIGN KEY (id_kriteria) REFERENCES public.m_kriteria_penilaian(id_kriteria)
);
