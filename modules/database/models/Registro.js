// Modelo da tabela Registro
module.exports = function (banco, tipo) {
  var Registro = banco.define('Registro', {
    // Coluna Sentido (se é entrada ou saída)
    'sentido': {
      'type': tipo.ENUM('entrada', 'saida'),
      'defaultValue': 'entrada',
      'allowNull': false
    },
    // Coluna Momento (timestamp da entrada/saída)
    'momento': {
      'type': tipo.DATE,
      'defaultValue': tipo.NOW,
      'allowNull': false,
      'validate': {
        'isAfter': '2016-09-01'
      }
    }
  }, {
    classMethods: {
      associate: function (models) {
        Registro.belongsTo(models.Pessoa);
        Registro.belongsTo(models.Cracha);
      }
    }
  })
  return Registro
}
