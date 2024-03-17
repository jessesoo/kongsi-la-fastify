import userStore from "../../data/users.js";
import { COOKIE_ACCESS_TOKEN } from "./constants.js";
import { createErrorPayload, errorInternalServer } from "./error.js";

function getBearerToken(header) {
  if (typeof header !== "string" || header == "") {
    return null;
  }

  const match = header.match(/^Bearer (.+)$/i);
  return match ? match[1] : null;
}

function createHasProductPermission(permission) {
  return async function hasProductPermission({ sqlite }, request, reply) {
    if (!request.user) {
      return reply.status(401).send(
        createErrorPayload({
          name: "error.invalidAuth",
          type: "general",
          message: "Invalid authentication",
        })
      );
    }

    const email = request.user.email;

    if (!email) {
      return reply.status(500).send(errorInternalServer());
    }

    let user;

    try {
      user = await userStore.getByEmailWithUserRoles(sqlite, { email });
    } catch (e) {
      console.error(e);
      return reply.status(500).send(errorInternalServer());
    }

    if (!user.isAdmin && !user.permissions[permission]) {
      return reply.status(401).send(
        createErrorPayload({
          name: `error.insufficientPrivilegeProduct.${permission}`,
          type: "general",
          message: "Authentication required",
        })
      );
    }
  };
}

export async function authenticate({ jwt }, request, reply) {
  const token =
    request.cookies[COOKIE_ACCESS_TOKEN] ||
    getBearerToken(request.headers.authorization);

  if (!token) {
    return reply.status(401).send(
      createErrorPayload({
        name: "error.insufficientPrivilege",
        type: "general",
        message: "Authentication required",
      })
    );
  }

  request.user = await jwt.verify(token);
}

export function isAdminOrWithProductPermission(permission) {
  return createHasProductPermission(permission);
}

export async function isAdmin({ sqlite }, request, reply) {
  if (!request.user) {
    return reply.status(401).send(
      createErrorPayload({
        name: "error.invalidAuth",
        type: "general",
        message: "Invalid authentication",
      })
    );
  }

  const email = request.user.email;

  if (!email) {
    return reply.status(500).send(errorInternalServer());
  }

  let user;

  try {
    user = await userStore.getByEmail(sqlite, { email });
  } catch (e) {
    console.error(e);
    return reply.status(500).send(errorInternalServer());
  }

  if (!user.isAdmin) {
    return reply.status(401).send(
      createErrorPayload({
        name: "error.insufficientPrivilege",
        type: "general",
        message: "Authentication required",
      })
    );
  }
}
