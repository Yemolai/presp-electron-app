// Modelo da tabela tipoDoc
module.exports = function (banco, tipo) {
  return banco.define('TipoDoc', {
    'descricao': {
      'type': tipo.STRING,
      'unique': true,
      'allowNull': false
    }
  }, {
    'timestamps': false
  })
}
