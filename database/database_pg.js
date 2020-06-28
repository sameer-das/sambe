const { Pool } = require('pg');
const { config } = require('../configurations/dbconfig');

const pool = new Pool(config);

console.log('DATABASE LOADED');

module.exports = { pool };