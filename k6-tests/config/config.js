const BASE_URL = __ENV.BASE_URL || "https://api.pmwcenter.tech";

const THRESHOLDS = {
  "http_req_duration{name:health}": ["p(95)<500", "p(99)<1500"],
  "http_req_duration{name:public_berita}": ["p(95)<500", "p(99)<1000"],
  "http_req_duration{name:auth_login}": ["p(95)<800", "p(99)<1200"],
  "http_req_duration{name:mahasiswa_profile}": ["p(95)<500", "p(99)<1000"],
  "http_req_duration{name:mahasiswa_tim_status}": ["p(95)<500", "p(99)<1000"],
  "http_req_duration{name:mahasiswa_proposal_status}": ["p(95)<500", "p(99)<1000"],
  "http_req_duration{name:mahasiswa_pembimbing_dosen}": ["p(95)<500", "p(99)<1000"],
  "http_req_duration{name:mahasiswa_bimbingan}": ["p(95)<500", "p(99)<1000"],
  "http_req_duration{name:admin_profile}": ["p(95)<500", "p(99)<1000"],
  "http_req_duration{name:admin_proposal}": ["p(95)<500", "p(99)<1000"],
  "http_req_duration{name:reviewer_profile}": ["p(95)<500", "p(99)<1000"],
  "http_req_duration{name:dosen_bimbingan_pengajuan}": ["p(95)<500", "p(99)<1000"],
  "http_req_duration{name:juri_penugasan}": ["p(95)<500", "p(99)<1000"],
  http_req_duration: ["p(95)<500", "p(99)<1000"],
  http_req_failed: ["rate<0.01"],
};

export { BASE_URL, THRESHOLDS };
