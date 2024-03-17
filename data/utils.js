import crypto from "crypto";

export function validateListingArguments({
  size,
  page,
  sortOrder,
  sortBy,
  sortColumns = [],
  priceFilter,
} = {}) {
  if (
    size < 1 ||
    page < 1 ||
    (sortOrder !== "ASC" && sortOrder !== "DESC") ||
    !Array.isArray(sortColumns) ||
    !sortColumns.includes(sortBy) ||
    (priceFilter &&
      (Number.isNaN(priceFilter.value) ||
        !["<", "<=", ">", ">="].includes(priceFilter.operator)))
  ) {
    throw new Error("Invalid arguments");
  }
}

export function validateId(id) {
  if (id == null) {
    throw new Error("Invalid ID");
  }
}

export function toNearestTenCent(price) {
  return Math.ceil(price * 10) / 10;
}

export function generateProducts(numProducts) {
  const numberOfSuppliers = 100;
  const products = [];
  const adjectives = [
    "Cosmic",
    "Galactic",
    "Volcanic",
    "Electric",
    "Tropical",
    "Swirly",
    "Gooey",
    "Chewy",
    "Mega",
    "Super",
    "Double",
    "Triple",
  ];
  const flavors = [
    "Chocolate",
    "Vanilla",
    "Strawberry",
    "Mango",
    "Coffee",
    "Mint Chocolate Chip",
    "Oreo Cookies",
    "Peanut Butter",
    "Banana",
    "Bubblegum",
  ];
  const items = [
    "Milkshake",
    "Ice-Cream",
    "Waffle",
    "Candy",
    "Lollipop",
    "Bread",
    "Twiggies",
    "Cookie",
    "Juice",
  ];
  const variants = [
    "Jumbo",
    "Indulgence",
    "Gigante",
    "Megabite",
    "Bonanza",
    "Muncheroo",
  ];
  const usedNames = new Set();

  while (products.length < numProducts) {
    // Generate a random price between $5 and $95
    const price = toNearestTenCent(Math.random() * 90 + 5).toFixed(2);
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const flavor = flavors[Math.floor(Math.random() * flavors.length)];
    const item = items[Math.floor(Math.random() * items.length)];
    const variant = variants[Math.floor(Math.random() * variants.length)];
    const name = `${adjective} ${flavor} ${variant} ${item}`;
    const image = `https://placehold.co/600x400?text=${adjective}`;

    if (usedNames.has(name)) {
      continue;
    }

    usedNames.add(name);

    products.push({
      flavor,
      name,
      image,
      price: parseFloat(price),
      supplier: {
        id: Math.floor(Math.random() * numberOfSuppliers) + 1,
      },
    });
  }

  return products;
}

export function formatPrice(price) {
  return (Math.round(price * 100) / 100).toFixed(2);
}
