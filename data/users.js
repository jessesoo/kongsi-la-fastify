import { tables, columns, permissions } from "./constants.js";

const ROLES_ADMIN = [
  permissions.systemRoles.PERMISSION_PRODUCT_CAN_CREATE,
  permissions.systemRoles.PERMISSION_PRODUCT_CAN_READ,
  permissions.systemRoles.PERMISSION_PRODUCT_CAN_UPDATE,
  permissions.systemRoles.PERMISSION_PRODUCT_CAN_DELETE,
  permissions.systemRoles.PERMISSION_ADMIN_ALL_OPERATION,
];

const MAPPING = {
  users: {
    id: "user_id",
    email: "user_email",
    password: "user_password",
    roles: "user_roles",
  },
  userRoles: {
    permissions: "user_roles_permissions",
  },
};

const mapRow = (row) => {
  if (!row) {
    return null;
  }

  const roles = (row[MAPPING.users.roles] || "").split("|");
  const userRoles = (row[MAPPING.userRoles.permissions] || "").split("|");

  return {
    id: row[MAPPING.users.id],
    email: row[MAPPING.users.email],
    password: row[MAPPING.users.password],
    roles,
    isAdmin: roles.includes(
      permissions.systemRoles.PERMISSION_ADMIN_ALL_OPERATION
    ),
    permissions: {
      canAddProduct:
        roles.includes(permissions.systemRoles.PERMISSION_PRODUCT_CAN_CREATE) ||
        userRoles.includes(permissions.userRoles.PERMISSION_PRODUCT_CAN_CREATE),
      canViewProduct:
        roles.includes(permissions.systemRoles.PERMISSION_PRODUCT_CAN_READ) ||
        userRoles.includes(permissions.userRoles.PERMISSION_PRODUCT_CAN_READ),
      canEditProduct:
        roles.includes(permissions.systemRoles.PERMISSION_PRODUCT_CAN_UPDATE) ||
        userRoles.includes(permissions.userRoles.PERMISSION_PRODUCT_CAN_UPDATE),
      canDeleteProduct:
        roles.includes(permissions.systemRoles.PERMISSION_PRODUCT_CAN_DELETE) ||
        userRoles.includes(permissions.userRoles.PERMISSION_PRODUCT_CAN_DELETE),
    },
  };
};

export default {
  list: async function (sqlite) {
    const rows = await sqlite.all(
      `
        SELECT ${columns.users.EMAIL}
        FROM ${tables.USERS}
      `
    );

    return rows.map((row) => ({
      email: row[columns.users.EMAIL],
    }));
  },
  getByEmailWithUserRoles: async function (sqlite, { email } = {}) {
    const row = await sqlite.get(
      `
        SELECT 
          t0.${columns.users.ID} AS ${MAPPING.users.id},
          t0.${columns.users.EMAIL} AS ${MAPPING.users.email},
          t0.${columns.users.PASSWORD} AS ${MAPPING.users.password},
          t0.${columns.users.ROLES} AS ${MAPPING.users.roles},
          GROUP_CONCAT(t2.${columns.userRoles.PERMISSIONS}) AS ${MAPPING.userRoles.permissions}
        FROM ${tables.USERS} t0
        LEFT JOIN ${tables.APPLIED_USER_ROLES} t1
          ON t1.${columns.appliedUserRoles.USER} = t0.${columns.userRoles.ID}
        LEFT JOIN ${tables.USER_ROLES} t2
          ON t2.${columns.userRoles.ID} = t1.${columns.appliedUserRoles.USER_ROLES}
        WHERE t0.${columns.users.EMAIL} = $email
      `,
      { $email: email }
    );

    if (!row) {
      return null;
    }

    return mapRow(row);
  },
  getByEmail: async function (sqlite, { email } = {}) {
    const row = await sqlite.get(
      `
        SELECT 
          t0.${columns.users.ID} AS ${MAPPING.users.id},
          t0.${columns.users.EMAIL} AS ${MAPPING.users.email},
          t0.${columns.users.PASSWORD} AS ${MAPPING.users.password},
          t0.${columns.users.ROLES} AS ${MAPPING.users.roles}
        FROM ${tables.USERS} t0
        WHERE t0.${columns.users.EMAIL} = $email
      `,
      { $email: email }
    );

    if (!row) {
      return null;
    }

    return mapRow(row);
  },
  addAdminRoles: async function (sqlite, { email } = {}) {
    const user = await this.getByEmail(sqlite, { email });
    const roles = [
      ...user.roles.filter((role) => !ROLES_ADMIN.includes(role)),
      ...ROLES_ADMIN,
    ].join("|");

    const result = await sqlite.run(
      `
        UPDATE ${tables.USERS}
        SET ${columns.users.ROLES} = $roles
        WHERE ${columns.users.EMAIL} = $email
      `,
      {
        $email: email,
        $roles: roles,
      }
    );

    if (result["changes"] > 0) {
      return true;
    }

    return false;
  },
  removeAdminRoles: async function (sqlite, { email } = {}) {
    const user = await this.getByEmail(sqlite, { email });
    const roles = user.roles
      .filter((role) => !ROLES_ADMIN.includes(role))
      .join("|");

    const result = await sqlite.run(
      `
        UPDATE ${tables.USERS}
        SET ${columns.users.ROLES} = $roles
        WHERE ${columns.users.EMAIL} = $email
      `,
      {
        $email: email,
        $roles: roles,
      }
    );

    if (result["changes"] > 0) {
      return true;
    }

    return false;
  },
};
