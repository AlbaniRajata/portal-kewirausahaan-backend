const pool = require('../src/config/db');
const teams = require('./tim_data.json');

const seedTim = async () => {
  const programResult = await pool.query("SELECT id_program FROM public.m_program WHERE nama_program = 'PMW'");
  if (programResult.rows.length === 0) {
    throw new Error('PMW program not found. Run seed program first.');
  }
  const id_program_pmw = programResult.rows[0].id_program;

  const kategoriResult = await pool.query('SELECT id_kategori, nama_kategori FROM public.m_kategori');
  const kategoriMap = {};
  for (const row of kategoriResult.rows) {
    kategoriMap[row.nama_kategori.toLowerCase()] = row.id_kategori;
  }

  const dosenResult = await pool.query(`
    SELECT u.id_user, u.nama_lengkap 
    FROM public.m_user u 
    JOIN public.m_dosen d ON u.id_user = d.id_user
  `);
  const dosenByName = {};
  for (const row of dosenResult.rows) {
    dosenByName[row.nama_lengkap] = row.id_user;
  }

  const mahasiswaResult = await pool.query(`
    SELECT u.id_user, m.nim 
    FROM public.m_user u 
    JOIN public.m_mahasiswa m ON u.id_user = m.id_user
  `);
  const nimToUserId = {};
  for (const row of mahasiswaResult.rows) {
    nimToUserId[row.nim] = row.id_user;
  }

  const currentYear = new Date().getFullYear();
  console.log(`Total tim dari JSON: ${teams.length}`);

  let timCount = 0;
  let proposalCount = 0;
  let pembimbingCount = 0;

  for (const team of teams) {
    try {
      const namaTimClean = `Tim ${team.no}`;
      
      const timResult = await pool.query(
        `INSERT INTO public.t_tim (id_program, nama_tim, status)
         VALUES ($1, $2, 1)
         ON CONFLICT ON CONSTRAINT unique_tim_per_program 
         DO UPDATE SET status = EXCLUDED.status
         RETURNING id_tim`,
        [id_program_pmw, namaTimClean]
      );
      const id_tim = timResult.rows[0].id_tim;
      timCount++;

      await pool.query('DELETE FROM public.t_anggota_tim WHERE id_tim = $1', [id_tim]);

      let ketuaUserId = null;
      const memberUserIds = [];

      for (const member of team.anggota) {
        const userId = nimToUserId[member.nim];
        if (!userId) {
          console.warn(`NIM ${member.nim} (${member.nama}) tidak ditemukan di m_mahasiswa, skip`);
          continue;
        }

        const peran = member.jabatan.toLowerCase() === 'ketua' ? 1 : 2;
        
        try {
          await pool.query(
            `INSERT INTO public.t_anggota_tim (id_tim, id_user, peran, status)
             VALUES ($1, $2, $3, 1)
             ON CONFLICT (id_tim, id_user) DO UPDATE SET peran = EXCLUDED.peran, status = 1`,
            [id_tim, userId, peran]
          );

          if (peran === 1) ketuaUserId = userId;
          memberUserIds.push(userId);
        } catch (err) {
          if (err.message.includes('one_ketua_per_tim')) {
            await pool.query(
              `INSERT INTO public.t_anggota_tim (id_tim, id_user, peran, status)
               VALUES ($1, $2, 2, 1)
               ON CONFLICT (id_tim, id_user) DO UPDATE SET peran = 2, status = 1`,
              [id_tim, userId]
            );
            memberUserIds.push(userId);
          } else {
            console.error(`Error insert anggota ${member.nim}: ${err.message}`);
          }
        }
      }

      if (!ketuaUserId && memberUserIds.length > 0) {
        ketuaUserId = memberUserIds[0];
      }

      const id_kategori = team.kategori ? kategoriMap[team.kategori.toLowerCase()] : null;

      if (id_kategori) {
        const existingProposal = await pool.query(
          'SELECT 1 FROM public.t_proposal WHERE id_tim = $1',
          [id_tim]
        );

        if (existingProposal.rows.length === 0) {
          await pool.query(
            `INSERT INTO public.t_proposal (id_tim, judul, file_proposal, status, id_program, id_kategori, modal_diajukan, tanggal_submit)
             VALUES ($1, $2, $3, 4, $4, $5, $6, NOW())`,
            [id_tim, team.judul, `proposal_tim_${id_tim}.pdf`, id_program_pmw, id_kategori, 5000000 + (team.no * 100000)]
          );
          proposalCount++;
        }
      }

      if (team.dosenPembimbing && ketuaUserId) {
        const cleanDosenName = team.dosenPembimbing;
        
        if (cleanDosenName && dosenByName[cleanDosenName]) {
          try {
            await pool.query(
              `INSERT INTO public.t_pengajuan_pembimbing (id_tim, id_program, id_dosen, diajukan_oleh, status, created_at, responded_at)
               VALUES ($1, $2, $3, $4, 1, NOW(), NOW())
               ON CONFLICT ON CONSTRAINT uq_pengajuan_pembimbing_id_tim 
               DO UPDATE SET id_dosen = EXCLUDED.id_dosen, status = EXCLUDED.status`,
              [id_tim, id_program_pmw, dosenByName[cleanDosenName], ketuaUserId]
            );
            pembimbingCount++;
          } catch (err) {
            console.error(`Error pengajuan pembimbing tim "${namaTimClean}": ${err.message}`);
          }
        } else if (cleanDosenName) {
          console.warn(`Dosen "${cleanDosenName}" tidak ditemukan di database`);
        }
      }

      for (const userId of memberUserIds) {
        try {
          await pool.query(
            `INSERT INTO public.t_peserta_program (id_user, id_program, tahun, status_lolos, id_tim, status_peserta)
             VALUES ($1, $2, $3, 1, $4, 1)
             ON CONFLICT ON CONSTRAINT t_peserta_program_pkey 
             DO UPDATE SET status_lolos = EXCLUDED.status_lolos, id_tim = EXCLUDED.id_tim`,
            [userId, id_program_pmw, currentYear, id_tim]
          );
        } catch (err) {
          console.error(`Error peserta program user ${userId}: ${err.message}`);
        }
      }
    } catch (error) {
      console.error(`Error seeding tim "${team.judul}": ${error.message}`);
    }
  }

  console.log(`${timCount} Tim seeded dari JSON`);
  console.log(`${proposalCount} Proposal created`);
  console.log(`${pembimbingCount} Pengajuan pembimbing created`);
};

module.exports = seedTim;
