/* eslint-disable camelcase */

exports.shorthands = undefined;

//To run these migrations: $env:DATABASE_URL="postgres://postgres:<postgres_password>@localhost:<postgres_port(5432)>/<database>" ; npm run migrate up

exports.up = (pgm) => {
  pgm.sql(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            bio VARCHAR (400),
            username VARCHAR(30) NOT NULL
        );
    `);
};

exports.down = (pgm) => {
  pgm.sql(`
        DROP TABLE users;
    `);
};
