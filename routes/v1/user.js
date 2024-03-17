import store from "../../data/users.js";
import { COOKIE_ACCESS_TOKEN } from "./constants.js";
import {
  createErrorPayload,
  errorInternalServer,
  errorNotFound,
  errorUnauthorized,
} from "./error.js";
import { handle } from "./utils.js";

async function toggleAdminModeHandler({ jwt, bcrypt, sqlite }, request, reply) {
  if (!request.user) {
    return reply.status(401).send(errorUnauthorized());
  }

  let user;

  try {
    user = await store.getByEmail(sqlite, { email: request.user.email });
  } catch (e) {
    console.error(e);
    return reply.status(500).send(errorInternalServer());
  }

  if (!user) {
    return reply.status(404).send(errorNotFound("User not found"));
  }

  try {
    if (user.isAdmin) {
      user = await store.removeAdminRoles(sqlite, {
        email: user.email,
      });
    } else {
      user = await store.addAdminRoles(sqlite, {
        email: user.email,
      });
    }
  } catch (e) {
    console.error(e);
    return reply.status(500).send(errorInternalServer());
  }
}

async function getMeHandler({ sqlite }, request, reply) {
  if (!request.user) {
    return reply.status(401).send(errorUnauthorized());
  }

  let user;

  try {
    user = await store.getByEmailWithUserRoles(sqlite, {
      email: request.user.email,
    });
  } catch (e) {
    console.error(e);
    return reply.status(500).send(errorInternalServer());
  }

  if (!user) {
    return reply.status(404).send(errorNotFound("User not found"));
  }

  return {
    email: user.email,
    isAdmin: user.isAdmin,
    permissions: user.permissions,
  };
}

async function logoutHandler({ jwt, bcrypt, sqlite }, request, reply) {
  reply.clearCookie(COOKIE_ACCESS_TOKEN);
}

async function loginHandler({ jwt, bcrypt, sqlite }, request, reply) {
  let user;

  try {
    user = await store.getByEmail(sqlite, { email: request.body.email });
  } catch (e) {
    console.error(e);
    return reply.status(500).send(errorInternalServer());
  }

  if (!user || !(await bcrypt.compare(request.body.password, user.password))) {
    return reply.status(401).send(
      createErrorPayload({
        name: "error.invalidCredentials",
        type: "general",
        message: "Invalid email/password",
      })
    );
  }

  const accessToken = await jwt.sign({ id: user.id, email: user.email });

  reply.setCookie(COOKIE_ACCESS_TOKEN, accessToken, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  return { accessToken, email: user.email };
}

export async function userRoutes(app) {
  app.route({
    method: "GET",
    url: "/me",
    onRequest: [app.authenticate],
    handler: handle(app, getMeHandler),
  });

  // Logout
  app.route({
    method: "DELETE",
    url: "/logout",
    handler: handle(app, logoutHandler),
  });

  // Toggle admin mode
  app.route({
    method: "POST",
    url: "/admin-mode",
    onRequest: [app.authenticate],
    handler: handle(app, toggleAdminModeHandler),
  });

  // Login
  app.route({
    method: "POST",
    url: "/login",
    schema: {
      body: {
        required: ["email", "password"],
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
          },
          password: {
            type: "string",
            minLength: 1,
          },
        },
      },
    },
    handler: handle(app, loginHandler),
  });
}
