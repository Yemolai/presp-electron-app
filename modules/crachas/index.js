angular.module('presp.crachas', ['presp'])
.config(function ($stateProvider) {
  $stateProvider
  .state('crachas', {
    url: '/crachas',
    templateUrl: 'modules/crachas/crachas.html',
    controller: 'CrachasCtrl',
    resolve: {
      Crachas: function (DB, $filter) {
        return DB.model.Registro.findAll({
          attributes: [ // atributos da tabela a serem requisitados
            'CrachaId',
            'sentido',
            'momento'
          ],
          where: { // condição "onde o id de crachá não for nulo"
            CrachaId: { // TODO definir cracha como required no modelo Registro
              $ne: null // not-equal null
            }
          },
          include: [{ model: DB.model.Cracha, attributes: ['id', 'nome'] }],
          group: ['CrachaId'], // ignora demais linhas com CrachaId redundante
          order: [['createdAt', 'DESC']] // organiza pelos mais recentes
        }).then(function (registros) {
          var crachas = {};
          for (var id in registros) {
            crachas[id] = registros[id].Cracha.get();
            crachas[id].disponivel = registros[id].sentido === 'saida';
            crachas[id].ultimoUso = $filter('date')(registros[id].momento, 'medium');
          }
          console.warn('crachas:', crachas);
          return crachas;
        });
      }
    }
  });
})
.controller('CrachasCtrl', function ($scope, Crachas) {
  $scope.crachas = Crachas;
  $scope.novoCracha = function () {

  };
});
