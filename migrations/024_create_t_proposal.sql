-- Migration: Create t_proposal table
-- Depends on: t_tim, m_program, m_kategori

CREATE TABLE IF NOT EXISTS public.t_proposal (
    id_proposal int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
    id_tim int4 NOT NULL,
    judul varchar(200) NOT NULL,
    file_proposal varchar(255) NULL,
    status int4 DEFAULT 0 NULL,
    id_program int4 NOT NULL,
    id_kategori int4 NOT NULL,
    modal_diajukan numeric(15, 2) NOT NULL,
    tanggal_submit timestamp NULL,
    wawancara_at timestamp NULL,
    CONSTRAINT t_proposal_pkey PRIMARY KEY (id_proposal),
    CONSTRAINT t_proposal_id_kategori_fkey FOREIGN KEY (id_kategori) REFERENCES public.m_kategori(id_kategori),
    CONSTRAINT t_proposal_id_tim_fkey FOREIGN KEY (id_tim) REFERENCES public.t_tim(id_tim) ON DELETE CASCADE
);
