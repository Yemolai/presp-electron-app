// módulo da lista de registros
angular.module('presp.list', ['presp', 'presp.database'])
.config(function ($stateProvider) { // configuração do módulo
  $stateProvider
  .state('list', { // estados
    cache: false,
    url: '/list',
    params: { offset: 0 },
    templateUrl: 'modules/list/list.html',
    controller: 'listCtrl',
    resolve: {
      R: function (DB, $stateParams) { // registros
        var queryOptions = {
          include: [{model: DB.model.Pessoa, as: 'Pessoa'}],
          omit: ['createdAt', 'updatedAt'],
          offset: ('offset' in $stateParams) ? $stateParams.offset : 0,
          limit: ('limit' in $stateParams) ? $stateParams.limit : 10,
        };
        return DB.listAll(DB.model.Registro, queryOptions);
      }, // end of R
      P: function (DB, $stateParams) { // contagens
        var p = {
          count: 0,
          offset: ('offset' in $stateParams) ? parseInt($stateParams.offset) : 0,
          limit: ('limit' in $stateParams) ? parseInt($stateParams.limit) : 10,
        };
        return DB.model.Registro.count().then(function (n) {
          if (n === null) {
            console.error('Problema ao solicitar número de registros');
            return -1;
          }
          p.count = parseInt(n);
          p.atBeginning = p.offset === 0;
          p.atEnding = p.offset+p.limit >= p.count;
          p.pageCount = Math.ceil(p.count/p.limit);
          p.pageActual = Math.ceil(p.offset/p.limit);
          p.lastPageOffset = (p.pageCount - 1) * p.limit;
          p.pages = [];
          for (var i = p.pageActual - 2; i <= p.pageActual + 2; i += 1) {
            if (i < 0 || i >= p.pageCount) {
              p.pages.push({num: '', enabled: false});
            } else {
              p.pages.push({num: i+1, enabled: true, offset: i*p.limit});
            }
          }
          return p;
        }).catch(function (err) {
          if (err) {
            console.error('Erro ao contar registros: ' + err);
          }
          return -1;
        });
      },
      T: function (DB) { // tipos de documentos
        var Docs = DB.listAll(DB.model.Doc);
        return Docs;
      } // end of T
    } // end of resolve
  }); // end of state
})
// Controller da lista de registros
.controller('listCtrl', function ($scope, $state, DB, R, T, P) {
  $scope.title = 'Lista de registros';
  $scope.registros = R; // lá do resolve do state
  $scope.doc = T; // ids dos tipos de documento
  $scope.searchText = '';
  $scope.pagination = P;
  function novamente(id, sentido) {
      DB.model.Registro.findById(id,{
        attributes: ['PessoaId']
      }).then(function (registro) {
        DB.model.Pessoa.findById(registro.PessoaId).then(function (pessoa) {
          return DB.model.Registro.create({
            'sentido': (sentido) ? 'entrada' : 'saida'
          }).then(function (novoRegistro) {
            return novoRegistro.setPessoa(pessoa).then(function () {
              console.warn('Novo registro feito.');
              $state.reload();
            }).catch(function (err) {
              console.error('Erro ao adicionar relacionamento ao novo registro: ', err);
            }); // end of catch relationship definition error
          }).catch(function (err) {
            console.error('Erro ao criar novo registro: ', err);
          }); // end of catch create new registry error
        }).catch(function (err) {
          console.error('Erro ao buscar pessoa relacionada: ', err);
        }); // end of find person by Id
      }).catch(function (err) {
        console.error('Erro ao buscar registro: ', err);
      }); // end of find registry error
  }

  $scope.entrada = function (id) {
    novamente(id, true);
  };

  $scope.saida = function (id) {
    novamente(id, false);
  };

  $scope.irPagina = function (offset) {
    $state.go('list', { 'offset': offset });
  };

  // TODO método para exclusão de registro
  $scope.delete = function (RegistryId) {
    console.warn('Não foi possível apagar o registro ' + RegistryId);
    console.warn('Sorry... not implemented yet.');
    window.alert('Desculpe, ainda não é possível excluir');
  };

});
