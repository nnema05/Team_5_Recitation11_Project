CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL,
    info TEXT
    -- ,
   -- myclothes TEXT[] 
   , last_seen_id INTEGER DEFAULT 1
);

-- creates database of outfits!!
CREATE TABLE IF NOT EXISTS outfits (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    tags TEXT,
    image TEXT 
);

CREATE TABLE IF NOT EXISTS myclothes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    tags TEXT NOT NULL,
    image TEXT NOT NULL,
    username VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS savedclothes (
    id SERIAL PRIMARY KEY,
    -- outfitId INTEGER NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
    image TEXT NOT NULL, -- Change from INTEGER to TEXT
    username VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE
);