import http from "k6/http";
import { check } from "k6";
import { BASE_URL } from "../config/config.js";

function normalizeCredentials(data) {
  return {
    mahasiswa: Array.isArray(data?.mahasiswa) ? data.mahasiswa : [],
    admin: Array.isArray(data?.admin) ? data.admin : [],
    reviewer: Array.isArray(data?.reviewer) ? data.reviewer : [],
    dosen: Array.isArray(data?.dosen) ? data.dosen : [],
    juri: Array.isArray(data?.juri) ? data.juri : [],
  };
}

function loadCredentials() {
  if (__ENV.CREDENTIALS_JSON) {
    try {
      return normalizeCredentials(JSON.parse(__ENV.CREDENTIALS_JSON));
    } catch (err) {
      throw new Error("CREDENTIALS_JSON is not valid JSON.");
    }
  }

  if (__ENV.CREDENTIALS_FILE) {
    try {
      const raw = tryOpenCredentials(__ENV.CREDENTIALS_FILE);
      return normalizeCredentials(JSON.parse(raw));
    } catch (err) {
      throw new Error("CREDENTIALS_FILE cannot be read or parsed. Try a path relative to the scenario file (e.g. ../credentials.local.json)." );
    }
  }

  throw new Error("Set CREDENTIALS_JSON or CREDENTIALS_FILE to provide test accounts.");
}

function tryOpenCredentials(filePath) {
  const candidates = [
    filePath,
    filePath.replace(/\\/g, "/"),
    `../${filePath}`,
    `../${filePath.replace(/\\/g, "/")}`,
  ];

  let lastError = null;
  for (const candidate of candidates) {
    try {
      return open(candidate);
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("Unable to read credentials file.");
}

export const credentials = loadCredentials();

export function login(email, password, extraTags) {
  const payload = JSON.stringify({ email, password });
  const tags = extraTags ? { name: "auth_login", ...extraTags } : { name: "auth_login" };
  const params = {
    headers: { "Content-Type": "application/json" },
    tags,
  };

  const res = http.post(`${BASE_URL}/api/v1/auth/login`, payload, params);
  const ok = check(res, { "login status is 200": (r) => r.status === 200 });

  if (!ok) return null;

  const body = res.json();
  return body && body.data && body.data.token ? body.data.token : null;
}

export function loginUsers(users) {
  const tokens = [];
  if (!Array.isArray(users) || users.length === 0) return tokens;
  for (const user of users) {
    const token = login(user.email, user.password);
    if (token) tokens.push(token);
  }
  return tokens;
}

export function authHeaders(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}
