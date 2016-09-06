// Modelo da tabela Registro
module.exports = function (banco, tipo) {
  return banco.define('Registro', {
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
        'isAfter': "2016-09-01"
      }
    }
  })
}
