import { tables, columns } from "./constants.js";

const MAPPING = {
  suppliers: {
    id: "supplier_id",
    name: "supplier_name",
  },
};

function mapRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row[MAPPING.suppliers.id],
    name: row[MAPPING.suppliers.name],
  };
}

export default {
  list: async function (sqlite, { id } = {}) {
    const rows = await sqlite.all(
      `
        SELECT 
          ${columns.suppliers.ID} AS ${MAPPING.suppliers.id}, 
          ${columns.suppliers.NAME} AS ${MAPPING.suppliers.name} 
        FROM ${tables.SUPPLIERS}
      `
    );

    return rows.map(mapRow).filter((row) => row != null);
  },
  getById: async function (sqlite, { id } = {}) {
    return mapRow(
      await sqlite.get(
        `
        SELECT 
          ${columns.suppliers.ID} AS ${MAPPING.suppliers.id}, 
          ${columns.suppliers.NAME} AS ${MAPPING.suppliers.name} 
        FROM ${tables.SUPPLIERS}
        WHERE ${columns.suppliers.ID} = $id
      `,
        { $id: id }
      )
    );
  },
};
