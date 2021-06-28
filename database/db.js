const { Pool }  = require("pg");

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'briefly',
  password: 'nyantaro',
})

module.exports = {
  query: (text, params) => {
    return pool.query(text, params);
  }
}
