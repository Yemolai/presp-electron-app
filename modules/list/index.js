// módulo da lista de registros
angular.module('presp.list', ['presp', 'presp.database'])
.config(function ($stateProvider) { // configuração do módulo
  $stateProvider
  .state('list', { // estados
    cache: false,
    url: '/list',
    templateUrl: 'modules/list/list.html',
    controller: 'listCtrl',
    resolve: {
      R: function (DB) { // registros
        var queryOptions = {
          attributes: ['id', 'momento', 'sentido', 'createdAt'],
          include: [{
            model: DB.model.Pessoa,
            as: 'Pessoa',
            attributes: ['id', 'nome', 'documento'],
            include: [{
              model: DB.model.Doc,
              attributes: ['id', 'descricao']
            }]
          }],
          order: [['momento', 'DESC']]
        };
        return DB.listAll(DB.model.Registro, queryOptions)
        .then(function (registros) {
          return registros.map(function (registro) {
            return {
              id: registro.id,
              momento: registro.momento,
              sentido: registro.sentido,
              nome: registro.Pessoa.nome,
              tipoDocumento: registro.Pessoa.Doc.descricao,
              documento: registro.Pessoa.documento,
              createdAt: registro.createdAt
            };
          });
        })
        .catch(function (e) {
          console.error(e);
        });
      } // end of R
    } // end of resolve
  }); // end of state
})
// Controller da lista de registros
.controller('listCtrl', function ($scope, $state, $stateParams, DB, R) {
  $scope.title = 'Lista de registros';
  $scope.registros = R; // lá do resolve do state
  $scope.count = R.length;
  $scope.offset = 0;
  $scope.limit = 10;
  $scope.searchText = '';
  var trOptions = {
    reload: true,
    inherit: false,
    notify: true
  };

  $scope.delete = function (RegistryId) {
    DB.model.Registro.findOne({
      where: {
        id: RegistryId
      }
    })
    .then(function (registro) {
      return registro.destroy();
    })
    .then(function () {
      window.alert('Apagado','O registro ' + RegistryId + ' foi apagado.');
      $state.transitionTo($state.current, $stateParams, trOptions);
    });
  };

});
