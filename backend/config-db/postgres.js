const { Pool } = require('pg');

// Create a new pool instance
const pool = new Pool({
  user: 'postgres',
  host: '129.146.72.183',
  database: 'postgres',
  password: '00Bc12aa4#',
  port: 5432, 
});


module.exports = pool;