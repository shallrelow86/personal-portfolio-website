import { test, expect } from "@playwright/test";

test.describe("API Routes", () => {
  test("GET /api/comments returns 405 (only POST is allowed)", async ({ request }) => {
    const response = await request.get("/api/comments");
    expect(response.status()).toBe(405);
  });

  test("POST /api/comments with empty body returns 400", async ({ request }) => {
    const response = await request.post("/api/comments", {
      data: {},
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test("POST /api/comments with missing fields returns validation error", async ({ request }) => {
    const response = await request.post("/api/comments", {
      data: {
        postId: "some-id",
        // missing authorName, authorEmail, body, turnstileToken
      },
    });
    expect(response.status()).toBe(400);
  });

  test("POST /api/admin/login with wrong password returns 401", async ({ request }) => {
    const response = await request.post("/api/admin/login", {
      data: { password: "wrong-password" },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test("POST /api/admin/login with correct password returns 200", async ({ request }) => {
    const response = await request.post("/api/admin/login", {
      data: { password: "xwl050511" },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test("POST /api/import-git-repo without URL returns 400", async ({ request }) => {
    const response = await request.post("/api/import-git-repo", {
      data: {},
    });
    expect(response.status()).toBe(400);
  });

  test("POST /api/revalidate without signature returns 401", async ({ request }) => {
    const response = await request.post("/api/revalidate", {
      data: { _type: "profile" },
    });
    expect(response.status()).toBe(401);
  });
});
