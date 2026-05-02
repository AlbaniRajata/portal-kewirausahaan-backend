process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key";
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/portal_test";
process.env.ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || "http://localhost:5173";

jest.mock("../config/db", () => ({
  query: jest.fn().mockResolvedValue({ rows: [] }),
  end: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../cron/proposalStatus.cron", () => ({}));

const request = require("supertest");
const app = require("../app");

describe("Auth Functional Tests", () => {
  describe("POST /api/v1/auth/login", () => {
    it("returns 400 when email and password are missing", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .set("Origin", "http://localhost:5173")
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("wajib diisi");
    });

    it("returns 400 for invalid email format", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .set("Origin", "http://localhost:5173")
        .send({ email: "invalid-email", password: "test123" })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("blocks SQL injection in email", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .set("Origin", "http://localhost:5173")
        .send({ email: "test' OR 1=1--", password: "test123" })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("returns 401 for invalid credentials", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .set("Origin", "http://localhost:5173")
        .send({ email: "test@example.com", password: "wrongpassword" })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/forgot-password", () => {
    it("returns 400 when email is missing", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .set("Origin", "http://localhost:5173")
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("returns 400 for invalid email format", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .set("Origin", "http://localhost:5173")
        .send({ email: "invalid" })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/register/mahasiswa", () => {
    it("returns 400 when required fields are missing", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register/mahasiswa")
        .set("Origin", "http://localhost:5173")
        .field("username", "testuser")
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("belum lengkap");
    });

    it("returns 400 for invalid email format", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register/mahasiswa")
        .set("Origin", "http://localhost:5173")
        .field("username", "testuser")
        .field("email", "invalid-email")
        .field("password", "password123")
        .field("nim", "12345678")
        .field("id_prodi", "1")
        .field("tahun_masuk", "2024")
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("returns 400 for short password", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register/mahasiswa")
        .set("Origin", "http://localhost:5173")
        .field("username", "testuser")
        .field("email", "test@example.com")
        .field("password", "short")
        .field("nim", "12345678")
        .field("id_prodi", "1")
        .field("tahun_masuk", "2024")
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("Redirect from old way to v1", () => {
    it("redirects /api/auth/login to /api/v1/auth/login", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .set("Origin", "http://localhost:5173")
        .send({ email: "test@example.com", password: "test" });

      expect(response.status).toBe(301);
      expect(response.headers.location).toContain("/api/v1/auth/login");
    });
  });
});
