const pool = require('../src/config/db');
const path = require('path');
const fs = require('fs');

const dataDistribusiPath = path.join(__dirname, 'distribusi_tahap2_raw.json');
const rawRooms = JSON.parse(fs.readFileSync(dataDistribusiPath, 'utf8'));

const normalizeTitle = (value) => {
  if (!value) return '';

  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[“”"'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[^a-z0-9]/g, '');
};

const seedDistribusiTahap2 = async () => {
  const adminResult = await pool.query("SELECT id_user FROM public.m_user WHERE username = 'admin.pmw'");
  const adminId = adminResult.rows[0]?.id_user || 1;

  const reviewersResult = await pool.query(`
    SELECT u.id_user, u.username 
    FROM public.m_user u 
    JOIN public.m_reviewer r ON u.id_user = r.id_user 
    ORDER BY u.id_user LIMIT 8
  `);
  const reviewers = reviewersResult.rows;

  const jurisResult = await pool.query(`
    SELECT u.id_user, u.username 
    FROM public.m_user u 
    JOIN public.m_juri j ON u.id_user = j.id_user 
    ORDER BY u.id_user LIMIT 8
  `);
  const juris = jurisResult.rows;

  if (reviewers.length < 8 || juris.length < 8) {
    console.warn("⚠ Reviewer atau Juri kurang dari 8, pastikan seeder 009 dan 010 sudah dijalankan.");
    return;
  }

  const proposalResult = await pool.query(`
    SELECT id_proposal, judul
    FROM public.t_proposal
    WHERE status = 4
  `);

  const proposalMap = new Map();
  for (const row of proposalResult.rows) {
    const key = normalizeTitle(row.judul);
    if (key && !proposalMap.has(key)) {
      proposalMap.set(key, row);
    }
  }

  let distReviewerCount = 0;
  let distJuriCount = 0;
  let notFoundProposals = [];

  for (const roomData of rawRooms) {
    const ruangIndex = roomData.room - 1; 
    
    if (ruangIndex >= reviewers.length || ruangIndex >= juris.length) {
      console.warn(`⚠ Tidak ada reviewer/juri untuk Ruang ${roomData.room}`);
      continue;
    }

    const id_reviewer = reviewers[ruangIndex].id_user;
    const id_juri = juris[ruangIndex].id_user;

    for (const judulText of roomData.proposals) {
      const cleanJudul = normalizeTitle(judulText);

      let matchedProposal = proposalMap.get(cleanJudul);

      if (!matchedProposal) {
        matchedProposal = proposalResult.rows.find((row) => {
          const dbKey = normalizeTitle(row.judul);
          return dbKey && (dbKey.includes(cleanJudul) || cleanJudul.includes(dbKey));
        });
      }

      if (matchedProposal) {
        const id_proposal = matchedProposal.id_proposal;

        await pool.query(
          `UPDATE public.t_proposal
           SET status = 5
           WHERE id_proposal = $1 AND status = 4`,
          [id_proposal]
        );
        
        await pool.query(
          `INSERT INTO public.t_distribusi_reviewer (id_proposal, id_reviewer, tahap, status, assigned_by)
           VALUES ($1, $2, 2, 1, $3)
           ON CONFLICT (id_proposal, id_reviewer, tahap)
           DO UPDATE SET
             status = 1,
             responded_at = NOW()
           WHERE t_distribusi_reviewer.status = 0`,
          [id_proposal, id_reviewer, adminId]
        );
        distReviewerCount++;

        await pool.query(
          `INSERT INTO public.t_distribusi_juri (id_proposal, id_juri, tahap, status, assigned_by)
           VALUES ($1, $2, 2, 1, $3)
           ON CONFLICT (id_proposal, id_juri, tahap)
           DO UPDATE SET
             status = 1,
             responded_at = NOW()
           WHERE t_distribusi_juri.status = 0`,
          [id_proposal, id_juri, adminId]
        );
        distJuriCount++;
      } else {
        notFoundProposals.push(`[Ruang ${roomData.room}] ${judulText}`);
      }
    }
  }

  console.log(`${distReviewerCount} Distribusi Reviewer Tahap 2 created berdasarkan raw JSON`);
  console.log(`${distJuriCount} Distribusi Juri Tahap 2 created berdasarkan raw JSON`);
  if (notFoundProposals.length > 0) {
    console.log(`⚠ ${notFoundProposals.length} proposal tidak cocok/ditemukan:`);
    notFoundProposals.forEach(p => console.log(`   - ${p}`));
  }
};

module.exports = seedDistribusiTahap2;
