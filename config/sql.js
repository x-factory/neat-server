var development = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host:     process.env.DB_HOST,
  dialect:  process.env.DB_DIALECT
};

var production = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host:     process.env.DB_HOST,
  dialect:  process.env.DB_DIALECT
};

module.exports = {
  development: development,
  production:  production
};
