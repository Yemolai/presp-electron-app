/* global angular, ENV */
angular.module('presp.database', ['presp'])
// Factory do banco de dados
.factory('DB', function () {
  var MODULE_DIR = 'modules/database/';
  var SQLITE_PATH = (ENV.db.internal) ? ENV.db.path : __dirname +'/'+ENV.db.path;
  var MODEL_DIR = __dirname + '/' + MODULE_DIR + 'models/';
  var fs = require('fs');
  var path = require('path');
  var Sequelize = require('sequelize'); // ORM
  var DB = {
    _seq: Sequelize,
    promise: Sequelize.Promise,
    lodash: Sequelize.Utils._,
    conn: new Sequelize('presp', 'un', '', { // objeto de conexão a ser utilizado
      dialect: 'sqlite',
      storage: SQLITE_PATH,
      logging: false
    }),
    model: {},
    export: function (exportFunction) { // exportFunction need to be callable
      var models = DB.model; // modelos
      var queries = [];
      var output = {};
      for (var modelName in models) {
        queries.push(models[modelName].findAll());
      }
      DB.promise.map(queries, function (queryResult) {
          var table = {};
          for (var line in queryResult) {
            table[queryResult[line].dataValues.id] = queryResult[line].get();
          }
          if (queryResult.length>0) {
            output[queryResult[0].Model.name] = table;
          }
        }).then(function () {
          // this then executes when all map finishes
          return output; // injects output as argument for next execution
        }).then(exportFunction); // callback function passed when called
    },
    listAll: function (model, options) { // Função para requisitar um SELECT ALL de um modelo
      var Results = [],
          findOptions = {},
          getRaw = false;
      if (typeof options !== 'undefined') {
        if ('include' in options) findOptions.include = options.include; // verifica se precisa de JOIN
        if ('attributes' in options && !('omit' in options)) { // verifica se determinou atributos a retornar
          findOptions.attributes = options.attributes;
        } else
        if ('omit' in options && !('attributes' in options) && options.omit.length > 0) { // verifica se determinou atributos a omitir
          findOptions.attributes = Object.keys(model.rawAttributes).filter(function (attr) {
            return options.omit.indexOf(attr) == -1; // omite os atributos determinados
          });
        } else if ('include' in options && 'omit' in options) {
          console.warn('Exclude and Attributes together, will not omit.'); // dispara alerta quando existem atributos e exclusões ao mesmo tempo
          findOptions.attributes = options.attributes;
        }
        if ('limit' in options) findOptions.limit = options.limit;
        if ('offset' in options && 'limit' in options) {
          findOptions.limit = options.limit;
          findOptions.offset = options.offset;
        }
        if (typeof options == 'undefined' && 'raw' in options) {
          getRaw = options.raw;
        }
      }
      return model.findAll(findOptions).then(function(rows) {
        if (rows === null) {
          console.warn('Nenhuma linha encontrada em ' + model.name + 's');
          return [];
        }
        rows.forEach(function (row) {
          if (getRaw) {
            Results.push(row.dataValues);
          } else {
            Results.push(row.get());
          }
        });
        return Results;
      }).catch(function (err) {
        if (err) {
          console.error('Erro ao buscar registros de ' + model.name + 's: ' + err);
          throw err;
        }
        return [];
      }); // findAll
    },
  };

  // modelos para tabelas de dados
  // lê cada item do diretório
  fs.readdirSync(MODEL_DIR).filter(function (file) { // filtrando
    return (file.indexOf('.') !== 0) && (file !== 'index.js'); // para que não inclua ., .., ocultos e o index.js
  }).forEach(function (file) { // para cada um da lista filtrada
    var model = DB.conn.import(path.join(MODEL_DIR, file)); // importe ao banco de dados
    DB.model[model.name] = model; // atribua o modelo na organização
  });

  Object.keys(DB.model).forEach(function (modelName) { // busque os índices da lista de modelos e para cada um
    if ('associate' in DB.model[modelName]) { // verifique se tem uma função de relacionamento
      DB.model[modelName].associate(DB.model); // se tiver, execute-a passando a lista de modelos
    }
  });

  // autentica, testa conexão e inicializa dados padrão
  DB.conn.authenticate().then(function (err) { // sequencia verificação
    if (err) { // trata erro
      console.error('Algo deu errado. Erro:' + err);
      throw err;
    }
    // cria tabelas se não existirem (force: false)
    return DB.conn.sync({force: false}).then(function () {
      // console.warn('DB sincronizado');
      // Para cada modelo, verifica se tem seed a ser inserido
      Object.keys(DB.model).forEach(function (modelName) {
        if ('seed' in DB.model[modelName]) { // se tiver seed
          DB.model[modelName].count().then(function (n) { // conta o conteúdo da tabela
            if (n < 1) { // se tiver menos de uma linha (ou seja, nenhuma linha)
              // realiza uma inserção massiva
              DB.model[modelName].bulkCreate(DB.model[modelName].seed()).then(function (/*rowList*/) {
                // e avisa no console só pra debug
                // console.warn('Created ' + rowList.length + ' rows in ' + modelName);
              })
              .catch(function (err) {
                if (err) {
                  console.error('Erro no bulkCreate: ' + err);
                }
              });
            }
          })
          .catch(function (err) {
            console.error('Erro ao contar linhas da tabela: ', err);
          });
        } else {
          // console.warn('O modelo ' + modelName + ' não tem seed.');
        }
      });
      return true;
    })
    .catch(function (err) {
      if (err) {
        console.error('Erro durante sync:' + err);
      }
    });
    // fim do encadeamento
  })
  // trata exceção/erro
  .catch(function (err) {
    console.error('Exceção durante tentativa de conexão.\nErro: ' + err);
  });
  // finaliza inicialização e exporta fábrica
  return DB;
});
