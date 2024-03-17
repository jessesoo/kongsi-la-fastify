const ROUTE_LOGIN = "/user/login";
const ROUTE_INVENTORY_ADD = "/inventory/add";
const ROUTES = [ROUTE_LOGIN];

const ERROR_GENERAL = {
  name: "error.general",
  type: "general",
  message: "Something went wrong. Please try again later.",
};

export function errorInternalServer(message) {
  return createErrorPayload({
    name: "error.http.internalServer",
    type: "general",
    message: message || "Server error.",
  });
}

export function errorBadRequest(message) {
  return createErrorPayload({
    name: "error.http.badRequest",
    type: "general",
    message: message || "Bad request.",
  });
}

export function errorNotFound(message) {
  return createErrorPayload({
    name: "error.http.notFound",
    type: "general",
    message: message || "Not found.",
  });
}

export function errorUnauthorized(message) {
  return createErrorPayload({
    name: "error.http.unauthorized",
    type: "general",
    message: message || "Unauthorized.",
  });
}

function handleInventoryAddValidationError(error) {
  if (error.schemaPath.indexOf("name") !== -1) {
    return createErrorPayload({
      name: "error.invalidName",
      type: "name",
      message: "Please enter a valid product name",
    });
  }

  if (error.schemaPath.indexOf("price") !== -1) {
    return createErrorPayload({
      name: "error.invalidPrice",
      type: "price",
      message: "Please enter a valid price",
    });
  }

  if (error.schemaPath.indexOf("supplier") !== -1) {
    return createErrorPayload({
      name: "error.invalidSupplier",
      type: "supplier",
      message: "Please provide a supplier ID",
    });
  }

  return ERROR_GENERAL;
}

function handleLoginValidationError(error) {
  if (error.schemaPath.indexOf("email") !== -1) {
    return {
      name: "error.invalidEmail",
      type: "email",
      message: "Please enter an email",
    };
  }

  if (error.schemaPath.indexOf("password") !== -1) {
    return {
      name: "error.invalidPassword",
      type: "password",
      message: "Please enter a password",
    };
  }

  return ERROR_GENERAL;
}

export function hasCustomValidationError(url) {
  return ROUTES.some((route) => url.endsWith(route));
}

export function mapValidationError(url, error) {
  if (url.endsWith(ROUTE_LOGIN)) {
    return handleLoginValidationError(error);
  }
  if (url.endsWith(ROUTE_INVENTORY_ADD)) {
    return handleInventoryAddValidationError(error);
  }
}

export function createErrorPayload({ name, type, message }) {
  return {
    errors: [
      {
        name,
        type,
        message,
      },
    ],
  };
}
