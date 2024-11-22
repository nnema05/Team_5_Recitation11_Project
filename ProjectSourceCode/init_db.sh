#!/bin/bash

# DO NOT PUSH THIS FILE TO GITHUB
# This file contains sensitive information and should be kept private

# TODO: Set your PostgreSQL URI - Use the External Database URL from the Render dashboard
PG_URI="postgresql://users_db_73jj_user:DtpyMQ09qOFmAx2pZAbGoxGaPYIrFQO1@dpg-csvmdtt2ng1s73dtk83g-a.oregon-postgres.render.com/users_db_73jj"

# Execute each .sql file in the directory
for file in src/init_data/*.sql; do
    echo "Executing $file..."
    psql $PG_URI -f "$file"
done