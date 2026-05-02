process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key";
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/portal_test";
process.env.ALLOWED_ORIGINS = "http://localhost:5173";

jest.mock("../config/db", () => ({
  query: jest.fn().mockResolvedValue({ rows: [] }),
  end: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../cron/proposalStatus.cron", () => ({}));

const request = require("supertest");
const app = require("../app");

describe("API Functional Tests", () => {
  describe("GET /health", () => {
    it("returns healthy status", async () => {
      const response = await request(app)
        .get("/health")
        .set("Origin", "http://localhost:5173")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.database).toBeDefined();
    });
  });

  describe("404 Handling", () => {
    it("returns 404 for unknown endpoints", async () => {
      const response = await request(app)
        .get("/api/unknown-endpoint")
        .set("Origin", "http://localhost:5173")
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it("returns 404 for unknown v1 endpoints", async () => {
      const response = await request(app)
        .get("/api/v1/unknown")
        .set("Origin", "http://localhost:5173")
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("CORS Protection", () => {
    it.skip("rejects requests from unauthorized origins", async () => {
      const response = await request(app)
        .get("/health")
        .set("Origin", "http://evil.com");

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Request Size Limit", () => {
    it.skip("returns 413 for too large payload", async () => {
      const largeData = "x".repeat(16 * 1024 * 1024); // 16MB string

      const response = await request(app)
        .post("/api/v1/auth/login")
        .set("Origin", "http://localhost:5173")
        .set("Content-Length", Buffer.byteLength(largeData))
        .send(largeData);

      expect(response.status).toBe(413);
      expect(response.body.success).toBe(false);
    });
  });

  describe("API Version Header", () => {
    it("includes version header in response", async () => {
      const response = await request(app)
        .get("/health")
        .set("Origin", "http://localhost:5173")
        .expect(200);

      expect(response.headers['api-version']).toBeDefined();
      expect(response.headers['x-api-version']).toBeDefined();
    });
  });
});
