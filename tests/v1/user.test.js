import { describe, it, before, after, mock } from "node:test";
import assert from "assert";

import build from "../../app.js";

describe("POST /api/v1/user/login", () => {
  let app;

  before(async function setup() {
    app = await build();
  });

  it("should fail with invalid email", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/user/login",
      body: {
        email: "testgmail.com",
        password: "123456",
      },
    });

    assert.strictEqual(response.statusCode, 400);
  });

  it("should fail with empty email and password", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/user/login",
      body: {
        email: "",
        password: "",
      },
    });

    assert.strictEqual(response.statusCode, 400);
  });

  it("should fail with invalid credentials", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/user/login",
      body: {
        email: "test@gmail.com",
        password: "wrong password",
      },
    });

    assert.strictEqual(response.statusCode, 401);
  });

  it("should fail and return proper response body", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/user/login",
      body: {
        email: "test@gmail.com",
        password: "wrong password",
      },
    });

    assert.strictEqual(response.statusCode, 401);
    assert.deepEqual(
      response.body,
      JSON.stringify({
        errors: [
          {
            name: "error.invalidCredentials",
            type: "general",
            message: "Invalid email/password",
          },
        ],
      })
    );
  });

  it("should pass and return proper response body", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/user/login",
      body: {
        email: "test@gmail.com",
        password: "123456",
      },
    });

    assert.strictEqual(response.statusCode, 200);

    const data = JSON.parse(response.body);
    assert.ok(data.accessToken != null);
    assert.equal(data.email, "test@gmail.com");
  });

  after(async function cleanup() {
    await app.close();
  });
});
