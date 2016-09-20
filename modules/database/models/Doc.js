// Modelo da tabela tipoDoc
module.exports = function (banco, tipo) {
  var Doc = banco.define('Doc', {
    'descricao': {
      'type': tipo.STRING,
      'unique': true,
      'allowNull': false
    }
  }, {
    classMethods: {
      seed: function () { // seed ALWAYS return an array of objects
        return [
          { id: 1, descricao: 'CPF' },
          { id: 2, descricao: 'RG' },
          { id: 3, descricao: 'CNH' },
          { id: 4, descricao: 'PIS/PASEP' }
        ];
      }
    },
    'timestamps': false
  });
  return Doc;
};
