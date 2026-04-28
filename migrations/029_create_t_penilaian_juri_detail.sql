-- Migration: Create t_penilaian_juri_detail table
-- Depends on: t_penilaian_juri, m_kriteria_penilaian

CREATE TABLE IF NOT EXISTS public.t_penilaian_juri_detail (
    id_detail serial4 NOT NULL,
    id_penilaian int4 NOT NULL,
    id_kriteria int4 NOT NULL,
    skor int4 NOT NULL,
    nilai int4 NOT NULL,
    catatan text NULL,
    created_at timestamp DEFAULT now() NULL,
    updated_at timestamp DEFAULT now() NULL,
    CONSTRAINT skor_check_juri CHECK ((skor = ANY (ARRAY[1, 2, 3, 5, 6, 7]))),
    CONSTRAINT t_penilaian_juri_detail_pkey PRIMARY KEY (id_detail),
    CONSTRAINT uq_penilaian_juri_kriteria UNIQUE (id_penilaian, id_kriteria),
    CONSTRAINT fk_pd_juri_kriteria FOREIGN KEY (id_kriteria) REFERENCES public.m_kriteria_penilaian(id_kriteria),
    CONSTRAINT fk_pd_juri_penilaian FOREIGN KEY (id_penilaian) REFERENCES public.t_penilaian_juri(id_penilaian) ON DELETE CASCADE
);
