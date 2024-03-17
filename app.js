import Fastify from "fastify";
import sqlite from "fastify-sqlite";
import bcrypt from "fastify-bcrypt";
import sensible from "@fastify/sensible";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";

import fs from "fs";
import path from "path";

import { userRoutes } from "./routes/v1/user.js";
import { userRolesRoutes } from "./routes/v1/user-roles.js";
import { inventoryRoutes } from "./routes/v1/inventory.js";
import { handle } from "./routes/v1/utils.js";
import {
  authenticate,
  isAdmin,
  isAdminOrWithProductPermission,
} from "./routes/v1/decorators.js";
import {
  hasCustomValidationError,
  mapValidationError,
} from "./routes/v1/error.js";

const DB_FILENAME = "db.sqlite";

export default async function build() {
  const app = Fastify({
    // logger: true,
  });

  app.register(bcrypt, { saltWorkFactor: 10 });
  app.register(sensible);
  app.register(helmet);
  app.register(cors, {
    origin: `*`,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
  });
  app.register(jwt, {
    secret: process.env.JWT_SECRET,
    sign: {
      // Refresh token implementation is omitted for simplicity, the access token will only expire in 365 days.
      expiresIn: "365d",
    },
  });
  app.register(cookie, {
    secret: process.env.COOKIE_SECRET,
    hook: "onRequest",
    parseOptions: {},
  });

  app.decorate("authenticate", handle(app, authenticate));
  app.decorate("isAdmin", handle(app, isAdmin));
  app.decorate(
    "isAdminOrCanAddProduct",
    handle(app, isAdminOrWithProductPermission("canAddProduct"))
  );
  app.decorate(
    "isAdminOrCanViewProduct",
    handle(app, isAdminOrWithProductPermission("canViewProduct"))
  );
  app.decorate(
    "isAdminOrCanEditProduct",
    handle(app, isAdminOrWithProductPermission("canEditProduct"))
  );
  app.decorate(
    "isAdminOrCanDeleteProduct",
    handle(app, isAdminOrWithProductPermission("canDeleteProduct"))
  );

  const dataExists = fs.existsSync(DB_FILENAME);

  // Initialize sqlite from the data file (or create a new one)
  await app.register(sqlite, {
    dbFile: DB_FILENAME,
    promiseApi: true,
    verbose: true,
  });

  if (!dataExists) {
    app.sqlite.exec(
      fs.readFileSync(path.join(process.cwd(), "schema.sql"), "utf-8")
    );
  }

  app.register(userRoutes, { prefix: "api/v1/user" });
  app.register(userRolesRoutes, { prefix: "api/v1/user-roles" });
  app.register(inventoryRoutes, { prefix: "api/v1/inventory" });

  app.setErrorHandler(async function (error, request, reply) {
    if (error.validation && hasCustomValidationError(request.url)) {
      return reply.status(400).send({
        errors: error.validation.map((e) => mapValidationError(request.url, e)),
      });
    }

    return reply.status(error.statusCode).send(error);
  });

  return app;
}
