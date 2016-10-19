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
      'Visitantes': function (DB, $filter) {
        return DB.getCrachas()
        .map(function (cracha) {
          cracha.momento = $filter('date')(cracha.momento, 'short', '-0300');
          return cracha;
        })
        .then(function (registros) {
          return registros.filter(function (R) {
            return R.sentido === 'entrada';
          });
        });
      }
    }
  });
})
.controller('VisitantesCtrl', function ($scope, $state, $stateParams, $filter, DB, Visitantes) {
  console.warn('Visitantes: ', Visitantes);
  var trOptions = {
    reload: true,
    inherit: false,
    notify: true
  };
  $scope.dateformat = function (data) {
    return $filter('date')(new Date(data),'short', '-0300');
  };
  $scope.visitantes = Visitantes;
  $scope.checkout = function (id) {
    DB.checkout(id, Visitantes)
    .then(function () {
      $state.transitionTo($state.current, $stateParams, trOptions);
    });

  }; // $state.transitionTo($state.current, $stateParams, trOptions);
});
