/* global angular */
angular.module('presp.database', ['presp', 'debug', 'env'])
// Factory do banco de dados
.factory('DB', function ($state, Debug, ENV) {
  var MODULE_DIR = 'modules/database/';
  var SQLITE_PATH = ENV.db.internal? ENV.db.path : __dirname+'/'+ENV.db.path;
  var MODEL_DIR = __dirname + '/' + MODULE_DIR + 'models/';
  var fs = require('fs');
  var path = require('path');
  var Sequelize = require('sequelize'); // ORM
  var connection;
  var dialeto = ENV.db.dialect;
  var args = {};

  switch (dialeto) {
    default:
      args = { user: '', pw: '', schema: '', options: { dialect: 'sqlite' } };
      break;

    case 'sqlite':
      args = { user: '', pw: '', schema: '' };
      args.options = { dialect: dialeto, storage: SQLITE_PATH };
      break;

    case 'mysql':
      args = { user: ENV.db.username, pw: ENV.db.password, schema: ENV.db.database }
      args.options = { host: ENV.db.host, dialect: dialeto };
      break;
  }
  if (!('logging' in ENV.db) || ENV.db.logging == false) {
    args.options.logging = false;
  }
  connection = new Sequelize(args.schema, args.user, args.pw, args.options);

  var DB = {
    _seq: Sequelize,
    promise: Sequelize.Promise,
    lodash: Sequelize.Utils._,
    conn: connection,
    model: {}
  };

  DB.getCrachas = function () {
    var Crachas = {};
    return DB.model.Cracha.findAll() // encontre todos os crachás
    .then(function (crachas) {
      var estados = [];
      crachas.forEach(function (c, i) {
        console.warn('c',c);
        Crachas[c.id] = crachas[i];
        estados.push(c.getRegistros());
        return c;
      })
      return estados;
    })
    .map(function (registros) {
      var ids = registros.map(function(o) {
        return o.id;
      });
      var max = Reflect.apply(Math.max, Math, ids);
      return registros.filter(function (r) {return (r.id===max);})[0];
    })
    .then(function (registros) {
      registros.forEach(function (r) {
        if (r.CrachaId in Crachas) {
          Crachas[r.CrachaId].UltimoRegistro = r.get();
        }
      });
      return registros;
    })
    .map(function (registro) {
      var data = {};
      return registro.getPessoa()
      .then(function (pessoa) {
        data.pessoa = pessoa;
        return data;
      })
      .then(function (data) {
        return data.pessoa.getDoc()
        .then(function (doc) {
          data.doc = doc;
          return data;
        });
      })
      .then(function (data) {
        var c = Crachas[registro.CrachaId];
        return {
          registroId: registro.id,
          crachaId: c.id,
          cracha: c.nome,
          pessoaId: data.pessoa.id,
          pessoa: data.pessoa.nome,
          sentido: registro.sentido,
          momento: registro.momento,
          tipoDocumento: data.doc.descricao,
          documento: data.pessoa.documento
        }
      });
    })
    .all()
    .then(function (registros) {
      return registros;
    })
    .catch(function (e) {
      console.error(e);
      console.error('Erro! ' + e.message);
    });
  }; // fim de getCrachas

  DB.checkout = function (id, visitantes) {
    var P = null;
    var C = null;
    var V = visitantes.filter(function (v) {
      return v.id == id;
    })[0];
    var saida = DB.model.Registro.build({
      momento: new Date(),
      sentido: 'saida'
    });
    return DB.model.Pessoa.findOne({ where: { id: V.pessoaId }})
    .then(function (pessoa) {
      if (pessoa === null) {
        var e = {msg: 'Não foi possível encontrar pessoa ' + V.pessoaId};
        throw e;
      }
      P = pessoa;
      return {};
    })
    .then(function () {
      return DB.model.Cracha.findOne({ where: { id: V.crachaId }})
      .then(function (cracha) {
        if (cracha === null) {
          var e = {msg: 'Não foi possível encontrar cracha ' + V.crachaId};
          throw e;
        }
        C = cracha;
        return {};
      });
    })
    .then(function () { return saida.save(); })
    .then(function () { return saida.setPessoa(P); })
    .then(function () { return saida.setCracha(C); })
    .catch(function (e) {
      window.alert('Desculpe, ocorreu um erro.');
      console.error('Erro: ', e);
    });
  }

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

  DB.listAll = function (model, options) { // Função para requisitar um SELECT ALL de um modelo
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
    })
    .catch(function (err) {
      if (err) {
        console.error('Erro ao buscar registros de ' + model.name + 's: ' + err);
        throw err;
      }
      return [];
    }); // findAll
  }

  DB.export = function (exportFunction) { // exportFunction need to be callable
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
  }

  DB.initialize = function () {
    DB.conn.authenticate() // autentica, testa conexão e inicializa dados padrão
    .then(function (err) { // sequencia verificação
      if (err) throw err;
      return DB.conn.sync({force: false}) // cria tabelas
      .then(function () {
        Object.keys(DB.model).map(function (modelName) {
          var result;
          if ('seed' in DB.model[modelName]) { // se tiver seed
            result = DB.model[modelName].count()
            .then(function (n) { // conta o conteúdo da tabela
              if (n < 1) { // se tabela está vazia
                // realiza uma inserção massiva
                return DB.model[modelName].bulkCreate(DB.model[modelName].seed())
                .then(function (/*rowList*/) {
                  if (ENV.debug) {
                    console.warn('Modelo ' + modelName + ' preenchido.');
                  }
                }); // bulkCreate
              } // if n<1
            }) // count then
            .catch(function (err) {
              console.error('Erro: ', err);
            });
          } else {
            if (ENV.debug) {
              console.warn('Modelo ' + modelName + ' não tem seed');
            }
            result = true;
          } // if seed else
          return result;
        }); // DB.model.keys map
        $state.go('home');
        return true;
      });
      // fim do encadeamento
    })
    // trata exceção/erro
    .catch(function (err) {
      console.error('Erro: ' + err);
    });
  }
  // finaliza inicialização e exporta fábrica
  return DB;
});
