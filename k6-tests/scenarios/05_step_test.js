import http from "k6/http";
import { check, group, sleep } from "k6";
import exec from "k6/execution";
import { BASE_URL, THRESHOLDS } from "../config/config.js";
import { authHeaders, credentials, login, loginUsers } from "../helpers/auth.js";

const STAGES = [
  { name: "vu_20", duration: "1m", target: 20 },
  { name: "vu_40", duration: "1m", target: 40 },
  { name: "vu_60", duration: "1m", target: 60 },
  { name: "vu_80", duration: "1m", target: 80 },
  { name: "vu_100", duration: "1m", target: 100 },
  { name: "vu_120", duration: "1m", target: 120 },
  { name: "vu_140", duration: "1m", target: 140 },
  { name: "vu_160", duration: "1m", target: 160 },
  { name: "vu_180", duration: "1m", target: 180 },
  { name: "vu_200", duration: "1m", target: 200 },
  { name: "cooldown", duration: "30s", target: 0 },
];

function durationToMs(value) {
  const count = parseFloat(value);
  if (Number.isNaN(count)) return 0;
  if (value.endsWith("m")) return count * 60 * 1000;
  if (value.endsWith("s")) return count * 1000;
  return count;
}

const STAGE_BOUNDS = (() => {
  let total = 0;
  return STAGES.map((stage) => {
    total += durationToMs(stage.duration);
    return { name: stage.name, endMs: total };
  });
})();

function getStageName() {
  const elapsedMs = exec.instance.currentTestRunDuration;
  for (const bound of STAGE_BOUNDS) {
    if (elapsedMs < bound.endMs) return bound.name;
  }
  return STAGE_BOUNDS[STAGE_BOUNDS.length - 1].name;
}

const stageThresholds = STAGES.filter((stage) => stage.name !== "cooldown")
  .reduce((acc, stage) => {
    acc[`http_req_duration{stage:${stage.name}}`] = ["p(95)<10000"];
    return acc;
  }, {});

export const options = {
  stages: STAGES.map((stage) => ({ duration: stage.duration, target: stage.target })),
  thresholds: { ...THRESHOLDS, ...stageThresholds },
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
  const stageTag = getStageName();

  group("health", () => {
    const res = http.get(`${BASE_URL}/health`, { tags: { name: "health", stage: stageTag } });
    check(res, { "health 200": (r) => r.status === 200 });
  });

  group("public_berita", () => {
    const res = http.get(`${BASE_URL}/api/v1/berita`, { tags: { name: "public_berita", stage: stageTag } });
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
      const newToken = login(user.email, user.password, { stage: stageTag });
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
        tags: { name: "mahasiswa_profile", stage: stageTag },
      });
      check(res, { "profile 200": (r) => r.status === 200 });
    });

    group("mahasiswa_tim_status", () => {
      const res = http.get(`${BASE_URL}/api/v1/mahasiswa/tim/status`, {
        ...params,
        tags: { name: "mahasiswa_tim_status", stage: stageTag },
      });
      check(res, { "tim status 200": (r) => r.status === 200 });
    });

    group("mahasiswa_proposal_status", () => {
      const res = http.get(`${BASE_URL}/api/v1/mahasiswa/proposal/status`, {
        ...params,
        tags: { name: "mahasiswa_proposal_status", stage: stageTag },
      });
      check(res, { "proposal status 200": (r) => r.status === 200 });
    });

    group("mahasiswa_pembimbing_dosen", () => {
      const res = http.get(`${BASE_URL}/api/v1/mahasiswa/pembimbing/dosen`, {
        ...params,
        tags: { name: "mahasiswa_pembimbing_dosen", stage: stageTag },
      });
      check(res, { "pembimbing dosen 200": (r) => r.status === 200 });
    });

    group("mahasiswa_bimbingan", () => {
      const res = http.get(`${BASE_URL}/api/v1/mahasiswa/bimbingan`, {
        ...params,
        tags: { name: "mahasiswa_bimbingan", stage: stageTag },
      });
      check(res, { "bimbingan 200": (r) => r.status === 200 });
    });
  }

  if (tokenAdmin) {
    const params = authHeaders(tokenAdmin);

    group("admin_profile", () => {
      const res = http.get(`${BASE_URL}/api/v1/admin/profile`, {
        ...params,
        tags: { name: "admin_profile", stage: stageTag },
      });
      check(res, { "admin profile 200": (r) => r.status === 200 });
    });

    group("admin_proposal", () => {
      const res = http.get(`${BASE_URL}/api/v1/admin/proposal`, {
        ...params,
        tags: { name: "admin_proposal", stage: stageTag },
      });
      check(res, { "admin proposal 200": (r) => r.status === 200 });
    });
  }

  if (tokenReviewer) {
    const params = authHeaders(tokenReviewer);

    group("reviewer_profile", () => {
      const res = http.get(`${BASE_URL}/api/v1/reviewer/profile`, {
        ...params,
        tags: { name: "reviewer_profile", stage: stageTag },
      });
      check(res, { "reviewer profile 200": (r) => r.status === 200 });
    });
  }

  if (tokenDosen) {
    const params = authHeaders(tokenDosen);

    group("dosen_bimbingan_pengajuan", () => {
      const res = http.get(`${BASE_URL}/api/v1/dosen/bimbingan/pengajuan`, {
        ...params,
        tags: { name: "dosen_bimbingan_pengajuan", stage: stageTag },
      });
      check(res, { "dosen bimbingan 200": (r) => r.status === 200 });
    });
  }

  if (tokenJuri) {
    const params = authHeaders(tokenJuri);

    group("juri_penugasan", () => {
      const res = http.get(`${BASE_URL}/api/v1/juri/penugasan`, {
        ...params,
        tags: { name: "juri_penugasan", stage: stageTag },
      });
      check(res, { "juri penugasan 200": (r) => r.status === 200 });
    });
  }

  sleep(1);
}
