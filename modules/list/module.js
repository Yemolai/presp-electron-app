// módulo da lista de registros
angular.module('presp.list', ['presp', 'presp.database'])
.config(function ($stateProvider) { // configuração do módulo
  $stateProvider
  .state('list', { // estados
    cache: false,
    url: "/list",
    params: { offset: 0 },
    templateUrl: "modules/list/list.html",
    controller: "listCtrl",
    resolve: {
      R: function (DB, $stateParams) { // registros
        var queryOptions = {
          include: [{model: DB.model.Pessoa,as: 'Pessoa'}],
          offset: $stateParams.offset,
          limit: 10,
        };
        return DB.model.Registro.findAll(queryOptions)
        .then(function (registros) {
          return registros;
        }); // end of query
      }, // end of R
      P: function (DB, $stateParams) {
        p = { offset: $stateParams.offset };
        return DB.model.Registro.count().then(function (n) {
          p.count = parseInt(n + '');
          // TODO implementar o objeto paginação aqui
          return p;
        })
      },
      T: function (DB) { // tipos de documentos
        return DB.model.TipoDoc.findAll()
        .then(function (t) { // t é a lista de tipos
          var L = []; // L é a lista organizada t.id:descricao
          for (var n in t) L[t[n].dataValues.id] = t[n].dataValues.descricao;
          return L;
        }); // end of query
      } // end of T
    } // end of resolve
  }) // end of state
})
// Controller da lista de registros
.controller('listCtrl', function ($scope, $state, DB, R, T, P) {
  $scope.title = "Lista de registros";
  $scope.registros = R; // lá do resolve do state
  $scope.doc = T; // ids dos tipos de documento
  $scope.searchText = "";
  $scope.count = P.count;
  $scope.offset = P.offset;
  $scope.pagination = []
  function novamente(id, sentido) {
      DB.model.Registro.findById(id,{
        attributes: ['PessoaId']
      }).then(function (registro) {
        DB.model.Pessoa.findById(registro.PessoaId).then(function (pessoa) {
          return DB.model.Registro.create({
            'sentido': (sentido) ? 'entrada' : 'saida'
          }).then(function (novoRegistro, created) {
            return novoRegistro.setPessoa(pessoa).then(function () {
              console.log("Novo registro feito.");
              $state.reload();
            }).catch(function (err) {
              console.error("Erro ao adicionar relacionamento ao novo registro: ", err);
            }); // end of catch relationship definition error
          }).catch(function (err) {
            console.error("Erro ao criar novo registro: ", err);
          }); // end of catch create new registry error
        }).catch(function (err) {
          console.error("Erro ao buscar pessoa relacionada: ", err);
        }); // end of find person by Id
      }).catch(function (err) {
        console.error("Erro ao buscar registro: ", err);
      }); // end of find registry error
  }

  $scope.entrada = function (id) {
    novamente(id, true);
  }

  $scope.saida = function (id) {
    novamente(id, false);
  }

  $scope.avancarPagina = function () {
    var offset = parseInt($scope.offset);
    offset = (offset > (parseInt($scope.count) - 10)) ? offset : offset + 10;
    $state.go('list', {'offset': offset });
  }

  $scope.retrocederPagina = function () {
    var offset = ($scope.offset < 10) ? 0 : $scope.offset - 10;
    $state.go('list', { 'offset': offset });
  }

  // TODO método para exclusão de registro
  $scope.delete = function (RegistryId) {
    console.log("Sorry... not implemented yet.");
    window.alert("Desculpe, ainda não é possível excluir");
  }

})
