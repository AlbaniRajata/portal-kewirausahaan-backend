-- Migration: Create t_refresh_token table
-- Depends on: m_user

CREATE TABLE IF NOT EXISTS public.t_refresh_token (
    id_refresh_token serial4 NOT NULL,
    id_user int4 NOT NULL,
    "token" text NOT NULL,
    expires_at timestamp NOT NULL,
    created_at timestamp DEFAULT now() NULL,
    CONSTRAINT t_refresh_token_pkey PRIMARY KEY (id_refresh_token),
    CONSTRAINT t_refresh_token_token_key UNIQUE (token),
    CONSTRAINT t_refresh_token_id_user_fkey FOREIGN KEY (id_user) REFERENCES public.m_user(id_user) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refresh_token_id_user ON public.t_refresh_token USING btree (id_user);
CREATE INDEX IF NOT EXISTS idx_refresh_token_token ON public.t_refresh_token USING btree (token);
