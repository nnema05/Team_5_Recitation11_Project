CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL,
    info TEXT
    -- myclothes TEXT[] 
);

-- creates database of outfits!!
CREATE TABLE IF NOT EXISTS outfits (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    tags TEXT,
    image TEXT
);

CREATE TABLE IF NOT EXISTS myclothes (
    username VARCHAR(50) REFERENCES users(username)
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    tags TEXT,
    image TEXT,
    
);