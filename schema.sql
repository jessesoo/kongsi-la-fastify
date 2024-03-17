CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    roles TEXT,
    email TEXT,
    password TEXT,
    created_at DATE DEFAULT CURRENT_TIMESTAMP,
    updated_at DATE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    created_at DATE DEFAULT CURRENT_TIMESTAMP,
    updated_at DATE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    supplier_id INTEGER,
    created_at DATE DEFAULT CURRENT_TIMESTAMP,
    updated_at DATE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

CREATE TABLE IF NOT EXISTS user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    permissions TEXT,
    created_at DATE DEFAULT CURRENT_TIMESTAMP,
    updated_at DATE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applied_user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_roles_id INTEGER,
    user_id INTEGER,
    created_at DATE DEFAULT CURRENT_TIMESTAMP,
    updated_at DATE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_roles_id) REFERENCES user_roles(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Update timestamp after a user is updated
CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Update timestamp after a supplier is updated
CREATE TRIGGER IF NOT EXISTS update_suppliers_timestamp
AFTER UPDATE ON suppliers
FOR EACH ROW
BEGIN
    UPDATE suppliers SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Update timestamp after a product is updated
CREATE TRIGGER IF NOT EXISTS update_products_timestamp
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Update timestamp after a user role is updated
CREATE TRIGGER IF NOT EXISTS update_user_roles_timestamp
AFTER UPDATE ON user_roles
FOR EACH ROW
BEGIN
    UPDATE user_roles SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Add users
INSERT INTO users (name, roles, email, password) VALUES 
    ('Admin', 'system.product.canCreate|system.product.canRead|system.product.canUpdate|system.product.canDelete', 'admin@gmail.com', '$2y$10$UO2s607sqzvKifxZz4mkXeNjQvEgwRWtqTEZi6S1kTbdagTCno3PS'),
    ('Guest User', '', 'user@gmail.com', '$2a$10$lvYwmq2A9gg9/bw0pGfczenh7lFv3IuxZzPMTz2rvqudF9Em7QZ0K'),
    ('Test User', '', 'test@gmail.com', '$2a$10$NNx7UQw5hnSo0ECAexl0BeF5HPRslHWlroJj6DaHih.aDIwK01XYi');

-- Add suppliers
INSERT INTO suppliers (name) VALUES 
  ('Swirled Dreams Supply Co.'),
  ('Moolicious Milkshake Mixers'),
  ('The Happy Udder Dairy'),
  ('Creamy Cloud Creations'),
  ('Flavor Frenzy Distributors'),
  ('Shake It Up! Supply'),
  ('The Churned Spoon'),
  ('The Milkshake Mile'),
  ('Udder Delight Dairy'),
  ('Scoops Aplenty'),
  ('The Whipped Creamery'),
  ('Malt Madness Mixes'),
  ('Scoopalicious Supplies'),
  ('The Flavor Fountain'),
  ('Heavenly Shakes Supply'),
  ('Cherry on Top Distributors'),
  ('The Milkshake Menagerie'),
  ('Chill Zone Creamery'),
  ('Sugar Rush Supply Co.'),
  ('The Sweet Sipping Straw'),
  ('The Blissful Blend'),
  ('Happy Cow Creamery'),
  ('Cloud Nine Creations'),
  ('Moo Moo Milkshake Mixes'),
  ('The Sip ''n Smile Supply'),
  ('Whipped Up Wonders'),
  ('The Flavor Fair'),
  ('Scoops & Smiles'),
  ('The Milkshake Emporium'),
  ('Sweet Dreams Dairy'),
  ('The Blended Bliss'),
  ('Tropical Twist Treats'),
  ('The Milkshake Masters'),
  ('Malt-tastic Mixes'),
  ('The Creamy Carousel'),
  ('Shakeology Supplies'),
  ('The Flavor Frontier'),
  ('The Sipping Spoon'),
  ('The Milkshake Marvels'),
  ('Scoops R Us'),
  ('Cloud 9 Creamery'),
  ('Sugar High Supply Co.'),
  ('Berrylicious Blends'),
  ('The Churned Perfection'),
  ('The Milkshake Mayhem'),
  ('Scoops Ahoy!'),
  ('The Whipped Dream'),
  ('Happy Days Dairy'),
  ('The Flavor Forecast'),
  ('Cherry Jubilee Distributors'),
  ('The Milkshake Maniacs'),
  ('Arctic Chill Creamery'),
  ('Candyland Creations'),
  ('The Sweet Sipping Straw II'),
  ('The Perfect Pour'),
  ('Whipped Cream Wonders'),
  ('The Flavor Fiesta'),
  ('Scoops Galore'),
  ('The Milkshake Metropolis'),
  ('Dreamland Dairy'),
  ('The Blended Paradise'),
  ('Island Breeze Blends'),
  ('The Milkshake Moguls'),
  ('Malt-a-Licious Mixes'),
  ('The Creamy Concoction'),
  ('Shakeology Supreme'),
  ('The Flavor Odyssey'),
  ('The Slurping Spoon'),
  ('The Milkshake Mystique'),
  ('Scoops of Joy'),
  ('Cloud Ten Creamery'),
  ('Sugar Rush Supply Co. II'),
  ('Chocolate Chip Dreams'),
  ('The Churned Masterpiece'),
  ('The Milkshake Meltdown'),
  ('Scoops Aplenty II'),
  ('The Whipped Euphoria'),
  ('Happy Trails Dairy'),
  ('The Flavor Fantasia'),
  ('Cherry on Top Distributors II'),
  ('The Milkshake Monarchs'),
  ('Arctic Blast Creamery'),
  ('Candy Cane Creations'),
  ('The Sweet Sipping Straw III'),
  ('The Perfect Blend'),
  ('Whipped Cream Paradise'), 
  ('The Flavor Festival'),
  ('Scoops of Sunshine'),
  ('The Milkshake Metropolis II'),
  ('Dreamweaver Dairy'),
  ('The Blended Elysium'),
  ('Tropical Twist Treats II'),
  ('The Milkshake Ministry'),
  ('Malt-tastic Mixes II'),
  ('The Creamy Cauldron'),
  ('Shakeology Supremacy'),
  ('The Flavor Expedition'),
  ('Whipped Dreamery Co'),
  ('Udder Delight Shakes'),
  ('The Flavor Blender');

-- Add products
INSERT INTO products (name, price, supplier_id) VALUES 
    ('Double Mango Milkshake', 12.9, 10);
