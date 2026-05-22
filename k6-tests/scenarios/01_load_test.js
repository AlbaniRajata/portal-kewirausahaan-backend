import http from "k6/http";
import { check, group, sleep } from "k6";
import { BASE_URL, THRESHOLDS } from "../config/config.js";
import { authHeaders, credentials, login, loginUsers } from "../helpers/auth.js";

export const options = {
  stages: [
    { duration: "1m", target: 50 },
    { duration: "3m", target: 50 },
    { duration: "30s", target: 0 },
  ],
  thresholds: THRESHOLDS,
};

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function setup() {
  const tokens = {
    mahasiswa: loginUsers(credentials.mahasiswa),
    admin: loginUsers(credentials.admin),
    reviewer: loginUsers(credentials.reviewer),
    dosen: loginUsers(credentials.dosen),
    juri: loginUsers(credentials.juri),
  };

  return { tokens, users: credentials };
}

export default function (data) {
  group("health", () => {
    const res = http.get(`${BASE_URL}/health`, { tags: { name: "health" } });
    check(res, { "health 200": (r) => r.status === 200 });
  });

  group("public_berita", () => {
    const res = http.get(`${BASE_URL}/api/v1/berita`, { tags: { name: "public_berita" } });
    check(res, { "berita 200": (r) => r.status === 200 });
  });

  let tokenMahasiswa = data.tokens.mahasiswa.length > 0 ? pickRandom(data.tokens.mahasiswa) : null;
  let tokenAdmin = data.tokens.admin.length > 0 ? pickRandom(data.tokens.admin) : null;
  let tokenReviewer = data.tokens.reviewer.length > 0 ? pickRandom(data.tokens.reviewer) : null;
  let tokenDosen = data.tokens.dosen.length > 0 ? pickRandom(data.tokens.dosen) : null;
  let tokenJuri = data.tokens.juri.length > 0 ? pickRandom(data.tokens.juri) : null;

  group("auth_login", () => {
    if (Math.random() < 0.1) {
      const roles = ["mahasiswa", "admin", "reviewer", "dosen", "juri"];
      const role = pickRandom(roles);
      const user = pickRandom(data.users[role]);
      const newToken = login(user.email, user.password);
      if (newToken && role === "mahasiswa") tokenMahasiswa = newToken;
      if (newToken && role === "admin") tokenAdmin = newToken;
      if (newToken && role === "reviewer") tokenReviewer = newToken;
      if (newToken && role === "dosen") tokenDosen = newToken;
      if (newToken && role === "juri") tokenJuri = newToken;
    }
  });

  if (tokenMahasiswa) {
    const params = authHeaders(tokenMahasiswa);

    group("mahasiswa_profile", () => {
      const res = http.get(`${BASE_URL}/api/v1/mahasiswa/profile`, {
        ...params,
        tags: { name: "mahasiswa_profile" },
      });
      check(res, { "profile 200": (r) => r.status === 200 });
    });

    group("mahasiswa_tim_status", () => {
      const res = http.get(`${BASE_URL}/api/v1/mahasiswa/tim/status`, {
        ...params,
        tags: { name: "mahasiswa_tim_status" },
      });
      check(res, { "tim status 200": (r) => r.status === 200 });
    });

    group("mahasiswa_proposal_status", () => {
      const res = http.get(`${BASE_URL}/api/v1/mahasiswa/proposal/status`, {
        ...params,
        tags: { name: "mahasiswa_proposal_status" },
      });
      check(res, { "proposal status 200": (r) => r.status === 200 });
    });

    group("mahasiswa_pembimbing_dosen", () => {
      const res = http.get(`${BASE_URL}/api/v1/mahasiswa/pembimbing/dosen`, {
        ...params,
        tags: { name: "mahasiswa_pembimbing_dosen" },
      });
      check(res, { "pembimbing dosen 200": (r) => r.status === 200 });
    });

    group("mahasiswa_bimbingan", () => {
      const res = http.get(`${BASE_URL}/api/v1/mahasiswa/bimbingan`, {
        ...params,
        tags: { name: "mahasiswa_bimbingan" },
      });
      check(res, { "bimbingan 200": (r) => r.status === 200 });
    });
  }

  if (tokenAdmin) {
    const params = authHeaders(tokenAdmin);

    group("admin_profile", () => {
      const res = http.get(`${BASE_URL}/api/v1/admin/profile`, {
        ...params,
        tags: { name: "admin_profile" },
      });
      check(res, { "admin profile 200": (r) => r.status === 200 });
    });

    group("admin_proposal", () => {
      const res = http.get(`${BASE_URL}/api/v1/admin/proposal`, {
        ...params,
        tags: { name: "admin_proposal" },
      });
      check(res, { "admin proposal 200": (r) => r.status === 200 });
    });
  }

  if (tokenReviewer) {
    const params = authHeaders(tokenReviewer);

    group("reviewer_profile", () => {
      const res = http.get(`${BASE_URL}/api/v1/reviewer/profile`, {
        ...params,
        tags: { name: "reviewer_profile" },
      });
      check(res, { "reviewer profile 200": (r) => r.status === 200 });
    });
  }

  if (tokenDosen) {
    const params = authHeaders(tokenDosen);

    group("dosen_bimbingan_pengajuan", () => {
      const res = http.get(`${BASE_URL}/api/v1/dosen/bimbingan/pengajuan`, {
        ...params,
        tags: { name: "dosen_bimbingan_pengajuan" },
      });
      check(res, { "dosen bimbingan 200": (r) => r.status === 200 });
    });
  }

  if (tokenJuri) {
    const params = authHeaders(tokenJuri);

    group("juri_penugasan", () => {
      const res = http.get(`${BASE_URL}/api/v1/juri/penugasan`, {
        ...params,
        tags: { name: "juri_penugasan" },
      });
      check(res, { "juri penugasan 200": (r) => r.status === 200 });
    });
  }

  sleep(1);
}
