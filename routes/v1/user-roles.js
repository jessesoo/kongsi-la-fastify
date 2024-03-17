import store from "../../data/user-roles.js";
import appliedUserRolesStore from "../../data/applied-user-roles.js";
import userStore from "../../data/users.js";
import { errorInternalServer, errorNotFound } from "./error.js";
import { handle } from "./utils.js";

async function listUserRolesHandler({ sqlite }, request, reply) {
  let userRoles = [];

  try {
    userRoles = await store.list(sqlite);
  } catch (e) {
    console.error(e);
    return reply.status(500).send(errorInternalServer());
  }

  let users;

  try {
    users = await userStore.list(sqlite);
  } catch (e) {
    console.error(e);
    return reply.status(500).send(errorInternalServer());
  }

  return {
    userRoles: userRoles.map((roles) => ({
      id: roles.id,
      name: roles.name,
      permissions: roles.permissions,
      targets: users.map((user) => {
        return {
          email: user.email,
          applied: roles.applied.includes(user.email),
        };
      }),
    })),
  };
}

async function updateUserRolesHandler({ sqlite }, request, reply) {
  const { id } = request.params;

  let userRoles;

  try {
    userRoles = await store.getById(sqlite, { id });
  } catch (e) {
    console.error(e);
    return reply.status(500).send(errorInternalServer());
  }

  if (!userRoles) {
    return reply.status(404).send(errorNotFound());
  }

  try {
    await store.updateById(sqlite, {
      id,
      name: request.body.name,
      permissions: request.body.permissions,
    });
  } catch (e) {
    console.error(e);
    return reply.status(500).send(errorInternalServer());
  }

  reply.status(204);
}

async function toggleUserRolesHandler({ sqlite }, request, reply) {
  let user;

  try {
    user = await userStore.getByEmail(sqlite, {
      email: request.body.email,
    });
  } catch (e) {
    console.error(e);
    return reply.status(500).send(errorInternalServer());
  }

  if (!user) {
    return reply.status(404).send(errorNotFound());
  }

  try {
    await appliedUserRolesStore.toggle(sqlite, {
      userRolesId: request.params.id,
      userId: user.id,
    });
  } catch (e) {
    console.error(e);
    return reply.status(500).send(errorInternalServer());
  }

  reply.status(204);
}

async function addUserRolesHandler({ sqlite }, request, reply) {
  let userRoles;

  try {
    userRoles = await store.add(sqlite, {
      name: request.body.name,
    });
  } catch (e) {
    console.error(e);
    return reply.status(500).send(errorInternalServer());
  }

  if (!userRoles) {
    return reply.status(500).send(errorInternalServer());
  }

  reply.status(201);

  return { userRoles };
}

export async function userRolesRoutes(app) {
  // List user roles
  app.route({
    method: "GET",
    url: "/",
    onRequest: [app.authenticate, app.isAdmin],
    handler: handle(app, listUserRolesHandler),
  });

  // Update user roles
  app.route({
    method: "PATCH",
    url: "/:id",
    onRequest: [app.authenticate, app.isAdmin],
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "integer", minimum: 1 },
        },
      },
      body: {
        required: ["name", "permissions"],
        type: "object",
        properties: {
          name: { type: "string", minLength: 1 },
          permissions: {
            type: "object",
            properties: {
              product: {
                type: "object",
                properties: {
                  canAdd: { type: "boolean" },
                  canView: { type: "boolean" },
                  canEdit: { type: "boolean" },
                  canDelete: { type: "boolean" },
                },
              },
            },
          },
        },
      },
    },
    handler: handle(app, updateUserRolesHandler),
  });

  // Add user roles
  app.route({
    method: "POST",
    url: "/",
    onRequest: [app.authenticate, app.isAdmin],
    schema: {
      body: {
        required: ["name"],
        type: "object",
        properties: {
          name: { type: "string", minLength: 1 },
        },
      },
    },
    handler: handle(app, addUserRolesHandler),
  });

  // Add user roles
  app.route({
    method: "POST",
    url: "/:id/toggle",
    onRequest: [app.authenticate, app.isAdmin],
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "integer", minimum: 1 },
        },
      },
      body: {
        required: ["email"],
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
        },
      },
    },
    handler: handle(app, toggleUserRolesHandler),
  });
}
