var ENV = {
  db: {
    dialect: 'sqlite',
    host: null,
    username: null,
    password: null,
    network: false,
    local: false,
    internal: true,
    path: 'database.sqlite'
  }
};
if (typeof module !== 'undefined' && 'exports' in module) {
  module.exports = ENV;
}
