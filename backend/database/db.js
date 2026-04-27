require('dotenv').config();

// Choose database: PostgreSQL (cloud) or SQLite (local)
const usePostgres = !!process.env.DATABASE_URL;

if (usePostgres) {
  module.exports = require('./postgres');
} else {
  module.exports = require('./db-sqlite');
}
