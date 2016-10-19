var ENV = {
  db: {
    dialect: 'sqlite',
    host: null,
    username: null,
    password: null,
    database: null,
    network: false,
    local: false,
    internal: true,
    path: 'database.sqlite',
    logging: true
  },
  debug: 'error'
};
if (typeof module !== 'undefined' && 'exports' in module) {
  module.exports = ENV;
}
