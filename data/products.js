import { tables, columns } from "./constants.js";
import {
  formatPrice,
  generateProducts,
  validateListingArguments,
} from "./utils.js";

const SORT_COLUMNS = [
  columns.products.ID,
  columns.products.NAME,
  columns.products.PRICE,
  columns.products.SUPPLIER,
];

const MAPPING = {
  products: {
    id: "product_id",
    name: "product_name",
    price: "product_price",
    count: "product_count",
  },
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
    id: row[MAPPING.products.id],
    name: row[MAPPING.products.name],
    price: formatPrice(row[MAPPING.products.price]),
    supplier: {
      id: row[MAPPING.suppliers.id],
      name: row[MAPPING.suppliers.name],
    },
  };
}

export default {
  count: async function (sqlite, { priceFilter } = {}) {
    // Define WHERE clauses
    let whereStatement = [];
    let whereParams = {};

    if (priceFilter) {
      whereStatement.push(
        `${columns.products.PRICE} ${priceFilter.operator} $price`
      );
      whereParams = {
        $price: priceFilter.value,
      };
    }

    const result = await sqlite.get(
      `
        SELECT 
          COUNT(${columns.products.ID}) as ${MAPPING.products.count}
        FROM ${tables.PRODUCTS}
        ${
          whereStatement.length > 0 ? "WHERE " + whereStatement.join("AND") : ""
        }
      `,
      {
        ...whereParams,
      }
    );

    return result ? result[MAPPING.products.count] : null;
  },
  list: async function (
    sqlite,
    { page = 1, size = 10, sortBy = "id", sortOrder = "ASC", priceFilter } = {}
  ) {
    validateListingArguments({
      page,
      size,
      sortBy,
      sortOrder,
      sortColumns: SORT_COLUMNS,
      priceFilter,
    });

    // Define WHERE clauses
    let whereStatement = [];
    let whereParams = {};

    if (priceFilter) {
      whereStatement.push(
        `t0.${columns.products.PRICE} ${priceFilter.operator} $price`
      );
      whereParams = {
        $price: priceFilter.value,
      };
    }

    const rows = await sqlite.all(
      `
        SELECT 
          t0.${columns.products.ID} AS ${MAPPING.products.id}, 
          t0.${columns.products.NAME} AS ${MAPPING.products.name}, 
          t0.${columns.products.PRICE} AS ${MAPPING.products.price},
          t1.${columns.suppliers.ID} AS ${MAPPING.suppliers.id},
          t1.${columns.suppliers.NAME} AS ${MAPPING.suppliers.name}
        FROM ${tables.PRODUCTS} t0
        JOIN ${tables.SUPPLIERS} t1
        ON t0.${columns.products.SUPPLIER}
         = t1.${columns.suppliers.ID}
        ${
          whereStatement.length > 0 ? "WHERE " + whereStatement.join("AND") : ""
        }
        ORDER BY t0.${sortBy} ${sortOrder}
        LIMIT $size OFFSET $offset
      `,
      {
        $size: size,
        $offset: (page - 1) * size,
        ...whereParams,
      }
    );

    return rows.map(mapRow).filter((row) => row != null);
  },
  getById: async function (sqlite, { id } = {}) {
    return mapRow(
      await sqlite.get(
        `
          SELECT 
            t0.${columns.products.ID} AS ${MAPPING.products.id}, 
            t0.${columns.products.NAME} AS ${MAPPING.products.name}, 
            t0.${columns.products.PRICE} AS ${MAPPING.products.price},
            t1.${columns.suppliers.ID} AS ${MAPPING.suppliers.id},
            t1.${columns.suppliers.NAME} AS ${MAPPING.suppliers.name}
          FROM ${tables.PRODUCTS} t0
          JOIN ${tables.SUPPLIERS} t1
            ON t0.${columns.products.SUPPLIER}
             = t1.${columns.suppliers.ID}
          WHERE t0.${columns.products.ID} = $id
        `,
        { $id: id }
      )
    );
  },
  add: async function (sqlite, { name, price, supplierId } = {}) {
    const result = await sqlite.run(
      `
        INSERT INTO ${tables.PRODUCTS}
          (${columns.products.NAME}, ${columns.products.PRICE}, ${columns.products.SUPPLIER})
        VALUES 
          ($name, $price, $supplierId)
      `,
      {
        $name: name,
        $price: price,
        $supplierId: supplierId,
      }
    );

    if (result["changes"] > 0) {
      return {
        id: result["lastID"],
        name,
        price,
        supplier: {
          id: supplierId,
        },
      };
    }

    return null;
  },
  updateById: async function (sqlite, { id, name, price, supplierId } = {}) {
    // Fields to update
    const setters = [];

    // Params for the SQL statement
    const params = {
      ["$id"]: id,
    };

    if (name != null) {
      setters.push(`${columns.products.NAME} = $name`);
      params["$name"] = name;
    }

    if (price != null) {
      setters.push(`${columns.products.PRICE} = $price`);
      params["$price"] = price;
    }

    if (supplierId != null) {
      setters.push(`${columns.products.SUPPLIER} = $supplierId`);
      params["$supplierId"] = supplierId;
    }

    // Skip if there are no fields to update
    if (setters.length === 0) {
      return;
    }

    const result = await sqlite.run(
      `
        UPDATE ${tables.PRODUCTS}
        SET ${setters.join(",")}
        WHERE ${columns.products.ID} = $id
      `,
      params
    );

    if (result["changes"] > 0) {
      return true;
    }

    return false;
  },
  deleteById: async function (sqlite, { id } = {}) {
    const result = await sqlite.run(
      `
        DELETE FROM ${tables.PRODUCTS}
        WHERE ${columns.products.ID} = $id
      `,
      {
        $id: id,
      }
    );

    return {
      isDeleted: result["changes"] > 0,
    };
  },
  populate: async function (sqlite) {
    const products = generateProducts(1000);

    // Remove existing products
    await sqlite.run(`DELETE FROM ${tables.PRODUCTS}`);

    // Reset ID sequence
    await sqlite.run(
      `UPDATE sqlite_sequence SET seq = 1 WHERE name = '${tables.PRODUCTS}'`
    );

    const result = await sqlite.run(
      `
        INSERT INTO ${tables.PRODUCTS} (
          ${columns.products.NAME}, 
          ${columns.products.PRICE}, 
          ${columns.products.SUPPLIER}
        ) VALUES
          ${products
            .map((product) => {
              return "(?, ?, ?)";
            })
            .join(",")}
      `,
      products.reduce((sum, currentProduct) => {
        sum.push(
          ...[
            currentProduct.name,
            currentProduct.price,
            currentProduct.supplier.id,
          ]
        );
        return sum;
      }, [])
    );

    if (result["changes"] > 0) {
      return products;
    }

    return null;
  },
};
