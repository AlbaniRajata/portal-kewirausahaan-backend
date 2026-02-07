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

    if (payload.id_program === 2) {
        const pmwStatus = await timDb.cekLolosPMW(user.id_user);
        if (!pmwStatus || pmwStatus.status_lolos !== 1) {
            return {
                error: "Untuk mendaftar program INBIS, Anda harus lolos program PMW terlebih dahulu.",
                field: "id_program"
            };
        }
    }

    if (!Array.isArray(payload.anggota)) {
        return {
            error: "Data anggota tim tidak valid.",
            field: "anggota"
        };
    }

    if (payload.anggota.length < 2 || payload.anggota.length > 4) {
        return {
            error: "Jumlah anggota tim harus minimal 2 dan maksimal 4 orang (total 3-5 termasuk ketua).",
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

        const currentYear = new Date().getFullYear();
        await timDb.insertPesertaProgram(client, user.id_user, payload.id_program, tim.id_tim, currentYear);

        for (const item of payload.anggota) {
            const target = await timDb.getMahasiswaByNim(item.nim);
            if (!target || target.status_verifikasi !== 1 || target.status_mahasiswa !== 1) {
                await client.query("ROLLBACK");
                return {
                    error: `Mahasiswa dengan NIM ${item.nim} tidak memenuhi syarat sebagai anggota tim.`,
                    field: "anggota"
                };
            }

            if (target.id_user === user.id_user) {
                await client.query("ROLLBACK");
                return {
                    error: "Anda tidak dapat menambahkan diri sendiri sebagai anggota.",
                    field: "anggota"
                };
            }

            const punyaTim = await timDb.cekUserPunyaTim(target.id_user);
            if (punyaTim) {
                await client.query("ROLLBACK");
                return {
                    error: `Mahasiswa dengan NIM ${item.nim} sudah terdaftar dalam tim lain.`,
                    field: "anggota"
                };
            }

            if (payload.id_program === 2) {
                const pmwStatus = await timDb.cekLolosPMW(target.id_user);
                if (!pmwStatus || pmwStatus.status_lolos !== 1) {
                    await client.query("ROLLBACK");
                    return {
                        error: `Mahasiswa dengan NIM ${item.nim} belum lolos program PMW dan tidak dapat bergabung di program INBIS.`,
                        field: "anggota"
                    };
                }
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

  const id_program = await timDb.getIdProgramByIdTim(id_tim);
  if (!id_program) {
    return {
      error: "Program tim tidak ditemukan.",
      field: "tim"
    };
  }

  if (id_program === 2) {
    const pmwStatus = await timDb.cekLolosPMW(user.id_user);
    if (!pmwStatus || pmwStatus.status_lolos !== 1) {
      return {
        error: "Anda belum lolos program PMW dan tidak dapat bergabung di program INBIS.",
        field: "tim"
      };
    }
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    await timDb.acceptAnggotaTim(id_tim, user.id_user);

    const currentYear = new Date().getFullYear();
    await timDb.insertPesertaProgram(client, user.id_user, id_program, id_tim, currentYear);

    await client.query("COMMIT");

    const data = await timDb.getTimDetail(id_tim);
    return { data };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
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

const getTimStatus = async (user) => {
  const tim = await timDb.getTimByUserId(user.id_user);
  
  if (!tim) {
    return {
      hasTim: false,
      isKetua: false,
      isAnggota: false,
      statusAnggota: null,
      data: null
    };
  }

  return {
    hasTim: true,
    isKetua: tim.peran === 1,
    isAnggota: tim.peran === 2,
    statusAnggota: tim.status_anggota,
    data: tim
  };
};

const getTimDetail = async (user) => {
  const detail = await timDb.getTimDetailByUserId(user.id_user);
  
  if (!detail) {
    return {
      error: "Anda belum terdaftar dalam tim apapun.",
      field: "tim"
    };
  }

  return { data: detail };
};

module.exports = {
    createTim,
    searchMahasiswa,
    acceptInvite,
    rejectInvite,
    getTimStatus,
    getTimDetail,
};