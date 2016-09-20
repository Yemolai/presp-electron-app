// Modelo da tabela Pessoa
module.exports = function (banco, tipo) {
  var Pessoa = banco.define('Pessoa', {
    'nome': {
      'type': tipo.STRING,
      'unique': true, // não pode repetir nomes
      'allowNull': false,
      'validate': {
        'notEmpty': true
      }
    }, // end nome
    // Coluna Documento (documento de identificação da pessoa)
    'documento': {
      'type': tipo.STRING,
      'unique': true, // não pode repetir documentos
      'allowNull': false,
      'validate': {
        'isAlphanumeric': true
      }
    }, // end documento
  }, {
    classMethods: {
      associate: function (models) {
        Pessoa.belongsTo(models.Doc)
      }
    }
  }) // end define
  return Pessoa
} // end export function
