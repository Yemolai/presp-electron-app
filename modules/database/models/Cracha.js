module.exports = function (db, tipo) {
  var Cracha = db.define('Cracha', {
    nome: {
      type: tipo.STRING,
      unique: true
    }
  }, {
    classMethods: {
      seed: function () { // seed ALWAYS return an array of objects
        return [
          { id: 1, nome: 'Visitante 1'}
        ];
      }
    }
  });
  return Cracha;
};
