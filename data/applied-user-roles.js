import { tables, columns } from "./constants.js";

export default {
  get: async function (sqlite, { userRolesId, userId }) {
    const row = await sqlite.get(
      `
        SELECT ${columns.appliedUserRoles.ID}
        FROM ${tables.APPLIED_USER_ROLES}
        WHERE ${columns.appliedUserRoles.USER_ROLES} = $userRolesId
          AND ${columns.appliedUserRoles.USER} = $userId
      `,
      { $userRolesId: userRolesId, $userId: userId }
    );

    if (!row) {
      return null;
    }

    return {
      id: row[columns.appliedUserRoles.ID],
    };
  },
  toggle: async function (sqlite, { userRolesId, userId } = {}) {
    const userRoles = await this.get(sqlite, { userRolesId, userId });

    let result;

    if (userRoles) {
      result = await sqlite.run(
        `
          DELETE FROM ${tables.APPLIED_USER_ROLES}
          WHERE ${columns.appliedUserRoles.USER_ROLES} = $userRolesId
            AND ${columns.appliedUserRoles.USER} = $userId
        `,
        {
          $userRolesId: userRolesId,
          $userId: userId,
        }
      );
    } else {
      result = await sqlite.run(
        `
          INSERT INTO ${tables.APPLIED_USER_ROLES}
            (${columns.appliedUserRoles.USER_ROLES}, ${columns.appliedUserRoles.USER})
          VALUES
            ($userRolesId, $userId)
        `,
        {
          $userRolesId: userRolesId,
          $userId: userId,
        }
      );
    }

    if (result["changes"] > 0) {
      return true;
    }

    return false;
  },
};
