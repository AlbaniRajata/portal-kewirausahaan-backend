const db = require("../../../config/db");
const timDb = require("../db/tim.db");

const createTim = async (user, payload) => {
    const mahasiswa = await timDb.getMahasiswaByUserId(user.id_user);
    if (!mahasiswa || mahasiswa.status_verifikasi !== 1 || mahasiswa.status_mahasiswa !== 1) {
        return {
            error: "Akun mahasiswa Anda belum memenuhi syarat untuk mengajukan tim.",
            field: "status_verifikasi"
        };
    }

    const sudahPunyaTim = await timDb.cekUserPunyaTim(user.id_user);
    if (sudahPunyaTim) {
        return {
            error: "Anda sudah terdaftar dalam sebuah tim dan tidak dapat membuat tim baru.",
            field: "tim"
        };
    }

    if (!Array.isArray(payload.anggota)) {
        return {
            error: "Data anggota tim tidak valid.",
            field: "anggota"
        };
    }

    if (payload.anggota.length < 3 || payload.anggota.length > 5) {
        return {
            error: "Jumlah anggota tim harus minimal 3 dan maksimal 5 orang.",
            field: "anggota"
        };
    }

    const client = await db.connect();
    try {
        await client.query("BEGIN");

        const tim = await timDb.createTim(
            client,
            payload.id_program,
            payload.nama_tim
        );

        await timDb.insertAnggotaTim(
            client,
            tim.id_tim,
            user.id_user,
            1,
            1
        );

        for (const item of payload.anggota) {
            const target = await timDb.getMahasiswaByNim(item.nim);
            if (!target || target.status_verifikasi !== 1 || target.status_mahasiswa !== 1) {
                await client.query("ROLLBACK");
                return {
                    error: "Salah satu anggota yang diajukan tidak memenuhi syarat sebagai anggota tim.",
                    field: "anggota"
                };
            }

            const punyaTim = await timDb.cekUserPunyaTim(target.id_user);
            if (punyaTim) {
                await client.query("ROLLBACK");
                return {
                    error: "Salah satu anggota yang diajukan sudah terdaftar dalam tim lain.",
                    field: "anggota"
                };
            }

            await timDb.insertAnggotaTim(
                client,
                tim.id_tim,
                target.id_user,
                2,
                0
            );
        }

        await client.query("COMMIT");

        const detailTim = await timDb.getTimDetail(tim.id_tim);
        return { data: detailTim };

    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

const searchMahasiswa = async (user, nim) => {
    if (!nim || nim.length < 3) {
        return {
            error: "Masukkan minimal 3 karakter NIM untuk melakukan pencarian.",
            field: "nim"
        };
    }

    const data = await timDb.searchMahasiswaByNim(nim);
    return { data };
};

const acceptInvite = async (user, id_tim) => {
  const invite = await timDb.getPendingInvite(id_tim, user.id_user);
  if (!invite) {
    return {
      error: "Undangan tim tidak ditemukan atau sudah diproses sebelumnya.",
      field: "tim"
    };
  }

  await timDb.acceptAnggotaTim(id_tim, user.id_user);

  const data = await timDb.getTimDetail(id_tim);
  return { data };
};

const rejectInvite = async (user, id_tim, catatan) => {
  if (!catatan) {
    return {
      error: "Catatan penolakan wajib diisi.",
      field: "catatan"
    };
  }

  if (typeof catatan !== "string" || catatan.trim().length < 5) {
    return {
      error: "Catatan penolakan harus diisi minimal 5 karakter.",
      field: "catatan"
    };
  }

  const invite = await timDb.getPendingInvite(id_tim, user.id_user);
  if (!invite) {
    return {
      error: "Undangan tim tidak ditemukan atau sudah diproses sebelumnya.",
      field: "tim"
    };
  }

  const affected = await timDb.rejectAnggotaTim(id_tim, user.id_user, catatan);
  if (!affected) {
    return {
      error: "Undangan tim gagal ditolak.",
      field: "tim"
    };
  }

  const data = await timDb.getTimDetail(id_tim);
  return {
    message: "Anda menolak undangan anggota.",
    catatan,
    data
  };
};

module.exports = {
    createTim,
    searchMahasiswa,
    acceptInvite,
    rejectInvite,
};
