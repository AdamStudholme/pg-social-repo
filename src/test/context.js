const { randomBytes } = require("crypto");
const { default: migrate } = require("node-pg-migrate");
const format = require("pg-format");
const pool = require("../pool");
const { password: DEFAULT_OPTS } = require("../../configs");

class Context {
  static async build() {
    // Randomly generating a role name to connect to PG as
    const roleName = "a" + randomBytes(4).toString("hex"); //postgres roles must begin with a letter hence 'a'
    //Connect to PG as normal
    await pool.connect(DEFAULT_OPTS);
    //Create new role
    await pool.query(
      // `CREATE ROLE ${roleName} WITH LOGIN PASSWORD '${roleName}'; ` //Rather than using a template literal you can use pg-format
      format(`CREATE ROLE %I WITH LOGIN PASSWORD %L;`, roleName, roleName) // I is for identififer (role, column name ,schema), L is for literal value
    );
    //Create a schema with the same name
    await pool.query(
      format(`CREATE SCHEMA %I AUTHORIZATION %I;`, roleName, roleName)
    );
    //Disconnect entirely from PG
    await pool.close();
    //Run migration files inside new schema
    await migrate({
      schema: roleName,
      direction: "up",
      log: () => {},
      noLock: true,
      dir: "migrations",
      databaseUrl: {
        host: "localhost",
        port: 5432,
        database: "socialnetwork-test",
        user: roleName,
        password: roleName,
      },
    });
    //Connect to pg as new role
    await pool.connect({
      host: "localhost",
      port: 5432,
      database: "socialnetwork-test",
      user: roleName,
      password: roleName,
    });

    return new Context(roleName);
  }

  constructor(roleName) {
    this.roleName = roleName;
  }

  async close() {
    //Disconnect from PG
    await pool.close();
    //Reconnect as root user
    await pool.connect(DEFAULT_OPTS);
    //Delete the role & schema created
    await pool.query(format("DROP SCHEMA %I CASCADE;", this.roleName));
    await pool.query(format("DROP ROLE %I;", this.roleName));
    //disconnect
    await pool.close();
  }

  async reset() {
    return pool.query(`
    DELETE FROM users;
    `);
  }
}

module.exports = Context;
