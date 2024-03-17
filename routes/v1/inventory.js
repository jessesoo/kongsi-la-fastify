import store from "../../data/products.js";
import supplierStore from "../../data/suppliers.js";
import {
  errorBadRequest,
  errorInternalServer,
  errorNotFound,
  errorUnauthorized,
} from "./error.js";
import { getPriceFilter, handle } from "./utils.js";

const PAGE_SIZE = 10;

async function listSuppliersHandler({ sqlite }, request, reply) {
  let suppliers = [];

  try {
    suppliers = await supplierStore.list(sqlite);
  } catch (e) {
    console.error(e);
    return reply.status(500).send(errorInternalServer());
  }

  return { suppliers };
}

async function listProductsHandler({ sqlite }, request, reply) {
  const page = request.query.page;
  const size = PAGE_SIZE;
  const priceFilter = getPriceFilter(request.query.price);

  let count;
  let products = [];

  try {
    count = await store.count(sqlite, {
      priceFilter,
    });

    products = await store.list(sqlite, {
      page,
      size,
      sortBy: request.query.sortBy,
      sortOrder: request.query.sortOrder.toUpperCase(),
      priceFilter,
    });
  } catch (e) {
    console.error(e);
    return reply.status(500).send(errorInternalServer());
  }

  return {
    products,
    pagination: {
      next: count > page * size,
      prev: size < page * size,
      pages: Math.ceil(count / size),
    },
  };
}

async function getProductByIdHandler({ sqlite }, request, reply) {
  let product;

  try {
    product = await store.getById(sqlite, { id: request.params.id });
  } catch (e) {
    console.error(e);
    return reply.status(500).send(errorInternalServer());
  }

  if (!product) {
    return reply.status(404).send(errorNotFound());
  }

  return { product };
}

async function populateInventoryHandler({ sqlite }, request, reply) {
  let products;

  try {
    products = await store.populate(sqlite);
  } catch (e) {
    console.error(e);
    return reply.status(500).send(errorInternalServer());
  }

  if (!products) {
    return reply.status(500).send(errorInternalServer());
  }

  reply.status(201);

  return { products };
}

async function updateProductHandler({ sqlite }, request, reply) {
  let supplier;

  if (request.body.supplier) {
    try {
      supplier = await supplierStore.getById(sqlite, {
        id: request.body.supplier,
      });
    } catch (e) {
      console.error(e);
      return reply.status(500).send(errorInternalServer());
    }

    if (!supplier) {
      return reply
        .status(400)
        .send(errorBadRequest("The supplier doesn't exist"));
    }
  }

  try {
    await store.updateById(sqlite, {
      id: request.params.id,
      name: request.body.name,
      price: request.body.price,
      supplierId: supplier && supplier.id,
    });
  } catch (e) {
    console.error(e);
    return reply.status(500).send(errorInternalServer());
  }

  reply.status(204);
}

async function addProductHandler({ sqlite }, request, reply) {
  let supplier;

  try {
    supplier = await supplierStore.getById(sqlite, {
      id: request.body.supplier,
    });
  } catch (e) {
    console.error(e);
    return reply.status(500).send(errorInternalServer());
  }

  if (!supplier) {
    return reply
      .status(400)
      .send(errorBadRequest("The supplier doesn't exist"));
  }

  let product;

  try {
    product = await store.add(sqlite, {
      name: request.body.name,
      price: request.body.price,
      supplierId: supplier.id,
    });
  } catch (e) {
    console.error(e);
    return reply.status(500).send(errorInternalServer());
  }

  if (!product) {
    return reply.status(500).send(errorInternalServer());
  }

  reply.status(201);

  return { product };
}

async function deleteProductHandler({ sqlite }, request, reply) {
  let result;

  try {
    result = await store.deleteById(sqlite, {
      id: request.params.id,
    });
  } catch (e) {
    console.error(e);
    return reply.status(500).send(errorInternalServer());
  }

  if (!result.isDeleted) {
    return reply.status(500).send(errorInternalServer());
  }

  reply.status(204);
}

export async function inventoryRoutes(app) {
  // List products
  app.route({
    method: "GET",
    url: "/",
    schema: {
      querystring: {
        type: "object",
        required: ["page", "sortBy", "sortOrder"],
        properties: {
          page: { type: "integer", minimum: 1, default: 1 },
          sortBy: {
            type: "string",
            enum: ["id", "name", "price"],
            default: "id",
          },
          sortOrder: {
            type: "string",
            enum: ["asc", "desc"],
            default: "asc",
          },
          price: {
            type: "string",
            pattern: "^(gt|gte|lt|lte):[0-9]+$",
          },
        },
      },
    },
    /*
      Mid-level task requires the products be accessible by the guests.
      Senior-level task requires a permission to view products.
      Uncomment the following line if the permission should not be enforced.
    */
    onRequest: [app.authenticate, app.isAdminOrCanViewProduct],
    handler: handle(app, listProductsHandler),
  });

  // Get a product
  app.route({
    method: "GET",
    url: "/:id",
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "integer", minimum: 1 },
        },
      },
    },
    /*
      Mid-level task requires the products be accessible by the guests.
      Senior-level task requires a permission to view products.
      Uncomment the following line if the permission should not be enforced.
    */
    onRequest: [app.authenticate, app.isAdminOrCanViewProduct],
    handler: handle(app, getProductByIdHandler),
  });

  // Populate the inventory with 1000 products
  app.route({
    method: "POST",
    url: "/populate",
    onRequest: [app.authenticate, app.isAdmin],
    handler: handle(app, populateInventoryHandler),
  });

  // List all the suppliers
  app.route({
    method: "GET",
    url: "/suppliers",
    handler: handle(app, listSuppliersHandler),
  });

  // Delete a product in the inventory
  app.route({
    method: "DELETE",
    url: "/delete/:id",
    onRequest: [app.authenticate, app.isAdminOrCanDeleteProduct],
    handler: handle(app, deleteProductHandler),
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "integer", minimum: 1 },
        },
      },
    },
  });

  // Update a product in the inventory
  app.route({
    method: "PATCH",
    url: "/update/:id",
    onRequest: [app.authenticate, app.isAdminOrCanEditProduct],
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "integer", minimum: 1 },
        },
      },
      body: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1 },
          price: { type: "number", minimum: 0 },
          supplier: { type: "integer", minimum: 1 },
        },
      },
    },
    handler: handle(app, updateProductHandler),
  });

  // Add a product to the inventory
  app.route({
    method: "POST",
    url: "/add",
    onRequest: [app.authenticate, app.isAdminOrCanAddProduct],
    schema: {
      body: {
        required: ["name", "price", "supplier"],
        type: "object",
        properties: {
          name: { type: "string", minLength: 1 },
          price: { type: "number", minimum: 0 },
          supplier: { type: "integer", minimum: 1 },
        },
      },
    },
    handler: handle(app, addProductHandler),
  });
}
