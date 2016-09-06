// Modelo da tabela Pessoa
module.exports = function (banco, tipo) {
  return banco.define('Pessoa', {
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
    // Coluna Crachá (Identificação específica)
    'cracha': {
      'type': tipo.STRING,
      'allowNull': true,
      'validate': {
        'isNumeric': true
        // TODO adicionar validação por RegExp
      }
    } // end crachá
  }) // end define
} // end export function
