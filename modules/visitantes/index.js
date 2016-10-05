/* global angular */
angular.module('presp.visitantes', ['presp', 'presp.database'])
.config(function ($stateProvider) {
  $stateProvider
  .state('visitantes', {
    url: '/visitantes',
    templateUrl: 'modules/visitantes/visitantes.html',
    controller: 'VisitantesCtrl',
    resolve: {
      'Visitantes': function (DB) {
        return DB.model.Registro.findAll({
          where: {
            CrachaId: {
              $ne: null
            }
          },
          attributes: [[DB.conn.fn('DISTINCT', DB.conn.col('CrachaId')), 'cracha']],
          order: [['createdAt', 'DESC']]
        }).then(function (crachas) {
          console.warn(crachas);
          return crachas;
        });
      }
    }
  });
}).controller('VisitantesCtrl', function ($scope, Visitantes) {
  $scope.visitantes = Visitantes;
});
