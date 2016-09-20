module.exports = function (db, tipo) {
  var Cracha = db.define('Cracha', {
    nome: {
      type: tipo.STRING,
      unique: true
    }
  })
  return Cracha
}
