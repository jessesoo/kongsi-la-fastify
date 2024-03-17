import { describe, it, before, after, mock } from "node:test";
import assert from "assert";

import build from "../../app.js";

describe("GET /api/v1/inventory", () => {
  let app;

  before(async function setup() {
    app = await build();
  });

  it("should fail without credentials", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/inventory",
    });

    assert.strictEqual(response.statusCode, 401);
  });

  it("should fail with invalid credentials (basic auth)", async () => {
    const { body } = await app.inject({
      method: "POST",
      url: "/api/v1/user/login",
      body: {
        email: "test@gmail.com",
        password: "123456",
      },
    });
    const { accessToken } = JSON.parse(body);
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/inventory",
      headers: {
        Authorization: `Basic ${accessToken}`,
      },
    });

    assert.strictEqual(response.statusCode, 401);
  });

  it("should fail with invalid credentials (empty auth)", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/inventory",
      headers: {
        Authorization: ``,
      },
    });

    assert.strictEqual(response.statusCode, 401);
  });

  it("should fail with invalid credentials (empty bearer token)", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/inventory",
      headers: {
        Authorization: `Bearer`,
      },
    });

    assert.strictEqual(response.statusCode, 401);
  });

  it("should pass with credentials", async () => {
    const { body } = await app.inject({
      method: "POST",
      url: "/api/v1/user/login",
      body: {
        email: "test@gmail.com",
        password: "123456",
      },
    });
    const { accessToken } = JSON.parse(body);
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/inventory",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    assert.strictEqual(response.statusCode, 200);
  });

  after(async function cleanup() {
    await app.close();
  });
});

describe("GET /api/v1/inventory/1", () => {
  let app;

  before(async function setup() {
    app = await build();
  });

  it("should fail without credentials", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/inventory",
    });

    assert.strictEqual(response.statusCode, 401);
  });

  it("should fail with invalid credentials (basic auth)", async () => {
    const { body } = await app.inject({
      method: "POST",
      url: "/api/v1/user/login",
      body: {
        email: "test@gmail.com",
        password: "123456",
      },
    });
    const { accessToken } = JSON.parse(body);
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/inventory",
      headers: {
        Authorization: `Basic ${accessToken}`,
      },
    });

    assert.strictEqual(response.statusCode, 401);
  });

  it("should fail with invalid credentials (empty auth)", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/inventory",
      headers: {
        Authorization: ``,
      },
    });

    assert.strictEqual(response.statusCode, 401);
  });

  it("should fail with invalid credentials (empty bearer token)", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/inventory",
      headers: {
        Authorization: `Bearer`,
      },
    });

    assert.strictEqual(response.statusCode, 401);
  });

  it("should pass with credentials", async () => {
    const { body } = await app.inject({
      method: "POST",
      url: "/api/v1/user/login",
      body: {
        email: "test@gmail.com",
        password: "123456",
      },
    });
    const { accessToken } = JSON.parse(body);
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/inventory",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    assert.strictEqual(response.statusCode, 200);
    assert.ok(Array.isArray(JSON.parse(response.body).products));
  });

  after(async function cleanup() {
    await app.close();
  });
});
