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

describe("app smoke tests", () => {
  it("returns a healthy response from /health", async () => {
    const response = await request(app)
      .get("/health")
      .set("Origin", "http://localhost:5173")
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("API is running");
    expect(response.body.environment).toBe("test");
    expect(response.body.database.status).toBe("healthy");
  });

  it("returns JSON for unknown endpoints", async () => {
    const response = await request(app)
      .get("/does-not-exist")
      .set("Origin", "http://localhost:5173")
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Endpoint tidak ditemukan");
  });
});