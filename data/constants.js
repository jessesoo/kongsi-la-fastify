export const tables = {
  USERS: "users",
  PRODUCTS: "products",
  SUPPLIERS: "suppliers",
  USER_ROLES: "user_roles",
  APPLIED_USER_ROLES: "applied_user_roles",
};

export const columns = {
  products: {
    ID: "id",
    FLAVOR: "flavor",
    NAME: "name",
    PRICE: "price",
    IMAGE: "image",
    SUPPLIER: "supplier_id",
  },
  suppliers: {
    ID: "id",
    NAME: "name",
  },
  users: {
    ID: "id",
    EMAIL: "email",
    PASSWORD: "password",
    ROLES: "roles",
  },
  userRoles: {
    ID: "id",
    NAME: "name",
    PERMISSIONS: "permissions",
  },
  appliedUserRoles: {
    ID: "id",
    USER_ROLES: "user_roles_id",
    USER: "user_id",
  },
};

export const permissions = {
  userRoles: {
    PERMISSION_PRODUCT_CAN_CREATE: "user.product.canCreate",
    PERMISSION_PRODUCT_CAN_READ: "user.product.canRead",
    PERMISSION_PRODUCT_CAN_UPDATE: "user.product.canUpdate",
    PERMISSION_PRODUCT_CAN_DELETE: "user.product.canDelete",
  },
  systemRoles: {
    PERMISSION_PRODUCT_CAN_CREATE: "system.product.canCreate",
    PERMISSION_PRODUCT_CAN_READ: "system.product.canRead",
    PERMISSION_PRODUCT_CAN_UPDATE: "system.product.canUpdate",
    PERMISSION_PRODUCT_CAN_DELETE: "system.product.canDelete",
    PERMISSION_ADMIN_ALL_OPERATION: "system.admin.all",
  },
};
