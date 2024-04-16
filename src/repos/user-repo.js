const pool = require("../pool");
const toCamelCase = require("./utils/to-camel-case");

/*
//There are multiple ways to implement the repository pattern. All are valid and have thr same end result.

//1) export a simple object with functions 
module.exports =  {
    find(){},
    findById(){},
    insert(){}
}

//2) create a class with functions and export an new instance of the class
class UserRepo {
    find(){}
    findById(){}
    insert(){}
}
module.exports = new UserRepo();

// 3) create a class with static functions and export the class.
class UserRepo {
    static find(){}
    static findById(){}
    static insert(){}
}

module.exports = UserRepo;
*/

class UserRepo {
  static async find() {
    const { rows } = await pool.query(`SELECT * FROM users;`);

    //Formatting object to remove _ in keys
    return toCamelCase(rows);
  }
  static async findById(id) {
    /*
    //WARNING REALLY BIG SECURITY RISK!!! NEVER DO THIS. SQL Injection Exploit. 
    //Do not concatenate any user input directly into your query
    const { rows } = await pool.query(`
    SELECT * FROM users
    WHERE id = ${id};`);
    */
    const { rows } = await pool.query(
      `
   SELECT * FROM users
   WHERE id = $1;`,
      [id]
    ); // writing the query like this means postgres 'prepares a statement to prevent SQL attacks.

    return toCamelCase(rows)[0];
  }

  static async insert(username, bio) {
    const { rows } = await pool.query(
      `
      INSERT INTO users (username, bio) VALUES ($1 , $2) RETURNING *
    `,
      [username, bio]
    );

    return toCamelCase(rows)[0];
  }
  static async update(id, username, bio) {
    const { rows } = await pool.query(
      `
      UPDATE users
      SET username = $1,
      bio = $2
      WHERE id = $3
      RETURNING *;
    `,
      [username, bio, id]
    );

    return toCamelCase(rows)[0];
  }
  static async delete(id) {
    const { rows } = await pool.query(
      `
      DELETE FROM users
      WHERE id = $1
      RETURNING *;
    `,
      [id]
    );

    return toCamelCase(rows)[0];
  }

  static async count() {
    const { rows } = await pool.query(`SELECT COUNT(*) FROM users`);
    return +rows[0].count;
  }
}

module.exports = UserRepo;
