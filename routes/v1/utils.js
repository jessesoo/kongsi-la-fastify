import { COOKIE_ACCESS_TOKEN } from "./constants.js";
import { errorUnauthorized } from "./error.js";

// Returns an async function that handles requests with the context provided.
export function handle(context, fn) {
  return async (request, reply) => {
    return await fn(context, request, reply);
  };
}

// For
export async function authenticate({ jwt }, request, reply) {
  const token = request.cookies[COOKIE_ACCESS_TOKEN];

  if (!token) {
    return reply.status(401).send(errorUnauthorized());
  }

  request.user = await jwt.verify(token);
}

// To decorate
export async function ensureAdmin({ userStore }, request, reply) {
  if (request.user.email) {
  }
}

/**
 *
 * @param {*} filter examples, "lt:30", "lte:20", "gt:10", "gt:5"
 */
export function getPriceFilter(filter) {
  if (!filter) {
    return null;
  }

  const [operator, rawValue] = filter.split(":");
  const value = parseInt(rawValue);

  switch (operator) {
    case "lt":
      return { operator: "<", value };
    case "lte":
      return { operator: "<=", value };
    case "gt":
      return { operator: ">", value };
    case "gte":
      return { operator: ">=", value };
    default:
      return null;
  }
}
