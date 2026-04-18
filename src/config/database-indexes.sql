CREATE INDEX IF NOT EXISTS idx_user_email ON m_user(email);
CREATE INDEX IF NOT EXISTS idx_user_username ON m_user(username);
CREATE INDEX IF NOT EXISTS idx_user_id_role ON m_user(id_role);
CREATE INDEX IF NOT EXISTS idx_user_is_active ON m_user(is_active);

CREATE INDEX IF NOT EXISTS idx_mahasiswa_nim ON m_mahasiswa(nim);
CREATE INDEX IF NOT EXISTS idx_mahasiswa_id_prodi ON m_mahasiswa(id_prodi);
CREATE INDEX IF NOT EXISTS idx_mahasiswa_id_user ON m_mahasiswa(id_user);

CREATE INDEX IF NOT EXISTS idx_dosen_nip ON m_dosen(nip);
CREATE INDEX IF NOT EXISTS idx_dosen_id_prodi ON m_dosen(id_prodi);
CREATE INDEX IF NOT EXISTS idx_dosen_id_user ON m_dosen(id_user);

CREATE INDEX IF NOT EXISTS idx_prodi_id_jurusan ON m_prodi(id_jurusan);
CREATE INDEX IF NOT EXISTS idx_prodi_id_kampus ON m_prodi(id_kampus);

CREATE INDEX IF NOT EXISTS idx_tim_id_program ON t_tim(id_program);
CREATE INDEX IF NOT EXISTS idx_tim_status ON t_tim(status);

CREATE INDEX IF NOT EXISTS idx_anggota_tim_id_tim ON t_anggota_tim(id_tim);
CREATE INDEX IF NOT EXISTS idx_anggota_tim_id_user ON t_anggota_tim(id_user);
CREATE INDEX IF NOT EXISTS idx_anggota_tim_peran ON t_anggota_tim(peran);

CREATE INDEX IF NOT EXISTS idx_peserta_program_id_user ON t_peserta_program(id_user);
CREATE INDEX IF NOT EXISTS idx_peserta_program_id_program ON t_peserta_program(id_program);
CREATE INDEX IF NOT EXISTS idx_peserta_program_id_tim ON t_peserta_program(id_tim);

CREATE INDEX IF NOT EXISTS idx_proposal_id_tim ON t_proposal(id_tim);
CREATE INDEX IF NOT EXISTS idx_proposal_id_program ON t_proposal(id_program);
CREATE INDEX IF NOT EXISTS idx_proposal_status ON t_proposal(status);
CREATE INDEX IF NOT EXISTS idx_proposal_tanggal_submit ON t_proposal(tanggal_submit DESC);

CREATE INDEX IF NOT EXISTS idx_distribusi_reviewer_id_proposal ON t_distribusi_reviewer(id_proposal);
CREATE INDEX IF NOT EXISTS idx_distribusi_reviewer_id_reviewer ON t_distribusi_reviewer(id_reviewer);
CREATE INDEX IF NOT EXISTS idx_distribusi_reviewer_tahap ON t_distribusi_reviewer(tahap);
CREATE INDEX IF NOT EXISTS idx_distribusi_reviewer_status ON t_distribusi_reviewer(status);

CREATE INDEX IF NOT EXISTS idx_pengajuan_pembimbing_id_tim ON t_pengajuan_pembimbing(id_tim);
CREATE INDEX IF NOT EXISTS idx_pengajuan_pembimbing_id_dosen ON t_pengajuan_pembimbing(id_dosen);
CREATE INDEX IF NOT EXISTS idx_pengajuan_pembimbing_status ON t_pengajuan_pembimbing(status);

CREATE INDEX IF NOT EXISTS idx_penilaian_reviewer_id_distribusi ON t_penilaian_reviewer(id_distribusi);
CREATE INDEX IF NOT EXISTS idx_penilaian_reviewer_status ON t_penilaian_reviewer(status);

CREATE INDEX IF NOT EXISTS idx_berita_status ON m_berita(status);
CREATE INDEX IF NOT EXISTS idx_berita_slug ON m_berita(slug);
CREATE INDEX IF NOT EXISTS idx_berita_id_author ON m_berita(id_author);
CREATE INDEX IF NOT EXISTS idx_berita_created_at ON m_berita(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_program_id ON m_program(id_program);
CREATE INDEX IF NOT EXISTS idx_tahap_id_program ON m_tahap(id_program);

CREATE INDEX IF NOT EXISTS idx_luaran_tim_id_tim ON t_luaran_tim(id_tim);
CREATE INDEX IF NOT EXISTS idx_luaran_tim_id_luaran ON t_luaran_tim(id_luaran);

CREATE INDEX IF NOT EXISTS idx_bimbingan_id_tim ON t_bimbingan(id_tim);
CREATE INDEX IF NOT EXISTS idx_bimbingan_id_dosen ON t_bimbingan(id_dosen);
CREATE INDEX IF NOT EXISTS idx_bimbingan_status ON t_bimbingan(status);

COMMENT ON INDEX idx_user_email IS 'Index for login lookup';
COMMENT ON INDEX idx_proposal_tanggal_submit IS 'Index for proposal ordering';
COMMENT ON INDEX idx_berita_created_at IS 'Index for berita ordering';