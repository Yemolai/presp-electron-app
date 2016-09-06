angular.module('presp.database', ['presp'])
// Factory do banco de dados
.factory('DB', function () {
  const MODULE_DIR = 'modules/database/'
  const SQLITE_PATH = MODULE_DIR + 'database.sqlite'
  const MODEL_DIR = __dirname + '/' + MODULE_DIR + 'models/'
  var DB = {};
  // bibliotecas ORM e DB
  DB.Sequelize = require('sequelize'); // ORM
  DB.sqlite3 = require('sqlite3'); // DB-specific

  // objeto de conexão a ser utilizado
  DB.conn = new DB.Sequelize('presp', 'un', '', {
    dialect: 'sqlite',
    storage: SQLITE_PATH,
    logging: false,
  });
  // modelos para tabelas de dados
  DB.model = {
    // tipo de documento
    'TipoDoc': DB.conn.import(MODEL_DIR + 'TipoDoc'),
    // pessoas registradas
    'Pessoa': DB.conn.import(MODEL_DIR + 'Pessoa'),
    // registro de fluxo
    'Registro': DB.conn.import(MODEL_DIR + 'Registro')
  };

  // Relacionamentos
  DB.model.Pessoa.belongsTo(DB.model.TipoDoc, {as: 'TipoDoc'}); // Pessoa tem TipoDoc
  DB.model.Registro.belongsTo(DB.model.Pessoa, {as: 'Pessoa'}); // Registro tem Pessoa

  // autentica, testa conexão e inicializa dados padrão
  DB.conn.authenticate() // autentica
  .then(function (err) { // sequencia verificação
    // console.log("Conexao estabelecida com sucesso.\nMensagem: " +
    //   ((typeof err == 'undefined')? "<nenhuma>" : err) );
    return DB.conn.sync() // cria tabelas se não existirem (force: false)
    // encadeamento de criação de linhas de tipo de documento com promessas:
    .then(function () {
      return DB.model.TipoDoc.findOrCreate({
        'where': { 'id': 1 },
        'defaults': { 'descricao': 'CPF' }
      })
    })
    .then(function () {
      return DB.model.TipoDoc.findOrCreate({
        'where': { 'id': 2 },
        'defaults': { 'descricao': 'RG' }
      })
    })
    .then(function () {
      return DB.model.TipoDoc.findOrCreate({
        'where': { 'id': 3 },
        'defaults': { descricao: 'CNH' }
      })
    })
    .then(function () {
      return DB.model.TipoDoc.findOrCreate({
        'where': { 'id': 4 },
        'defaults': { 'descricao': 'PIS/PASEP' }
      })
    })
    // fim do encadeamento
  })
  // trata exceção/erro
  .catch(function (err) {
    console.error("Exceção durante tentativa de conexão.\nErro: " + err)
  });
  // finaliza instânciação e exporta fábrica
  return DB
})
