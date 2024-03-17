import {
  tables,
  columns,
  permissions as permissionsCollection,
} from "./constants.js";

const MAPPING = {
  userRoles: {
    id: "user_roles_id",
    name: "user_roles_name",
    permissions: "user_roles_permissions",
  },
  users: {
    applied: "applied",
  },
};

function mapRow(row) {
  if (!row || !row[MAPPING.userRoles.id]) {
    return null;
  }

  const permissions = (row[MAPPING.userRoles.permissions] || "").split("|");

  return {
    id: row[MAPPING.userRoles.id],
    name: row[MAPPING.userRoles.name],
    array: permissions,
    permissions: {
      product: {
        canAdd: permissions.includes(
          permissionsCollection.userRoles.PERMISSION_PRODUCT_CAN_CREATE
        ),
        canView: permissions.includes(
          permissionsCollection.userRoles.PERMISSION_PRODUCT_CAN_READ
        ),
        canEdit: permissions.includes(
          permissionsCollection.userRoles.PERMISSION_PRODUCT_CAN_UPDATE
        ),
        canDelete: permissions.includes(
          permissionsCollection.userRoles.PERMISSION_PRODUCT_CAN_DELETE
        ),
      },
    },
    applied: (row[MAPPING.users.applied] || "").split(","),
  };
}

export default {
  list: async function (sqlite) {
    const rows = await sqlite.all(
      `
        SELECT 
          t0.${columns.userRoles.ID} AS ${MAPPING.userRoles.id}, 
          t0.${columns.userRoles.NAME} AS ${MAPPING.userRoles.name}, 
          t0.${columns.userRoles.PERMISSIONS} AS ${MAPPING.userRoles.permissions},
          GROUP_CONCAT(t2.${columns.users.EMAIL}) AS ${MAPPING.users.applied}
        FROM ${tables.USER_ROLES} t0
        LEFT JOIN ${tables.APPLIED_USER_ROLES} t1
          ON t0.${columns.userRoles.ID} = t1.${columns.appliedUserRoles.USER_ROLES}
        LEFT JOIN ${tables.USERS} t2
          ON t1.${columns.appliedUserRoles.USER} = t2.${columns.users.ID}
        ORDER BY ${MAPPING.userRoles.id} DESC
      `
    );

    return rows.map(mapRow).filter((row) => row != null);
  },
  getById: async function (sqlite, { id } = {}) {
    return mapRow(
      await sqlite.get(
        `
        SELECT 
          ${columns.userRoles.ID} AS ${MAPPING.userRoles.id}, 
          ${columns.userRoles.NAME} AS ${MAPPING.userRoles.name}, 
          ${columns.userRoles.PERMISSIONS} AS ${MAPPING.userRoles.permissions}
        FROM ${tables.USER_ROLES}
        WHERE ${columns.userRoles.ID} = $id
      `,
        {
          $id: id,
        }
      )
    );
  },
  add: async function (sqlite, { name } = {}) {
    const result = await sqlite.run(
      `
        INSERT INTO ${tables.USER_ROLES}
          (${columns.userRoles.NAME})
        VALUES ($name)
      `,
      {
        $name: name,
      }
    );

    if (result["changes"] > 0) {
      return {
        id: result["lastID"],
        name,
      };
    }

    return null;
  },
  updateById: async function (sqlite, { id, name, permissions } = {}) {
    const currentRoles = await this.getById(sqlite, { id });

    // Fields to update
    const setters = [];

    // Params for the SQL statement
    const params = {
      ["$id"]: id,
    };

    if (name != null) {
      setters.push(`${columns.userRoles.NAME} = $name`);
      params["$name"] = name;
    }

    if (permissions && permissions.product) {
      const { product } = currentRoles.permissions;
      const set = new Set(currentRoles.array);

      if (permissions.product.canAdd) {
        set.add(permissionsCollection.userRoles.PERMISSION_PRODUCT_CAN_CREATE);
      } else {
        set.delete(
          permissionsCollection.userRoles.PERMISSION_PRODUCT_CAN_CREATE
        );
      }

      if (permissions.product.canView) {
        set.add(permissionsCollection.userRoles.PERMISSION_PRODUCT_CAN_READ);
      } else {
        set.delete(permissionsCollection.userRoles.PERMISSION_PRODUCT_CAN_READ);
      }

      if (permissions.product.canEdit) {
        set.add(permissionsCollection.userRoles.PERMISSION_PRODUCT_CAN_UPDATE);
      } else {
        set.delete(
          permissionsCollection.userRoles.PERMISSION_PRODUCT_CAN_UPDATE
        );
      }

      if (permissions.product.canDelete) {
        set.add(permissionsCollection.userRoles.PERMISSION_PRODUCT_CAN_DELETE);
      } else {
        set.delete(
          permissionsCollection.userRoles.PERMISSION_PRODUCT_CAN_DELETE
        );
      }

      setters.push(`${columns.userRoles.PERMISSIONS} = $permissions`);
      params["$permissions"] = Array.from(set).join("|");
    }

    // Skip if there are no fields to update
    if (setters.length === 0) {
      return;
    }

    const result = await sqlite.run(
      `
        UPDATE ${tables.USER_ROLES}
        SET ${setters.join(",")}
        WHERE ${columns.userRoles.ID} = $id 
      `,
      params
    );

    if (result["changes"] > 0) {
      return true;
    }

    return false;
  },
};
