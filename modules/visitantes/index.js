/* global angular */
angular.module('presp.visitantes', ['presp', 'presp.database'])
.config(function ($stateProvider) {
  $stateProvider
  .state('visitantes', {
    url: '/visitantes',
    templateUrl: 'modules/visitantes/visitantes.html',
    controller: 'VisitantesCtrl',
    cache: false,
    resolve: {
      'Visitantes': function (DB) {
        return DB.model.Registro.findAll({
          where: {
            CrachaId: {
              $ne: null
            }
          },
          include: [
            { model: DB.model.Pessoa, include: [DB.model.Doc] },
            { model: DB.model.Cracha }
          ],
          group: ['CrachaId'],
          order: [['createdAt', 'DESC'], 'Cracha.nome']
        })
        .then(function (crachas) {
          var visit = {};
          for (var id in crachas) {
            if (crachas[id].sentido == 'entrada') {
              visit[id] = crachas[id];
            }
          }
          console.warn('visit', visit);
          return visit;
        });
      }
    }
  });
}).controller('VisitantesCtrl', function ($scope, $state, $stateParams, DB, Visitantes) {
  $scope.visitantes = Visitantes;
  $scope.checkout = function (id) {
    console.warn('Realizando checkout do registro ' + id);
    DB.model.Registro.create({
      sentido: 'saida'
    })
    .then(function (registro) {
      var PessoaInstance = Visitantes[id].Pessoa;
      return registro.setPessoa(PessoaInstance)
      .then(function () { return registro; });
    })
    .then(function (registro) {
      var CrachaInstance = Visitantes[id].Cracha;
      return registro.setCracha(CrachaInstance)
      .then(function () { return registro; });
    })
    .then(function (registro) {
      console.warn('Registro: ', registro);
      $state.transitionTo($state.current, $stateParams, {
        reload: true, inherit: false, notify: true
      });
    });
  };
});
