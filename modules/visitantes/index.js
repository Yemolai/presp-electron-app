/* global angular */
angular.module('presp.visitantes', ['presp', 'presp.database', 'debug'])
.config(function ($stateProvider) {
  $stateProvider
  .state('visitantes', {
    url: '/visitantes',
    templateUrl: 'modules/visitantes/visitantes.html',
    controller: 'VisitantesCtrl',
    cache: false,
    resolve: {
      'Visitantes': function (DB) {
        return DB.getCrachas()
        .then(function (listaDeCrachas) {
          var crachasEmUso = [];
          angular.forEach(listaDeCrachas, function (cracha) {
            if (cracha.sentido === 'entrada') {
              this.push(cracha);
            }
          }, crachasEmUso);
          return crachasEmUso;
        });
      }
    }
  });
})
.controller('VisitantesCtrl', function ($scope, $state, $stateParams, $filter, DB, Debug, Visitantes) {
  Debug.info('Visitantes: ', Visitantes);
  var trOptions = {
    reload: true,
    inherit: false,
    notify: true
  };
  $scope.dateformat = function (data) {
    return $filter('date')(new Date(data),'short', '-0300');
  };
  $scope.numeroDeVisitantes = Object.keys(Visitantes).length;
  $scope.visitantes = Visitantes;
  $scope.checkout = function (id) {
    DB.checkout(id, Visitantes)
    .then(function () {
      $state.transitionTo($state.current, $stateParams, trOptions);
    });

  }; // $state.transitionTo($state.current, $stateParams, trOptions);
});
