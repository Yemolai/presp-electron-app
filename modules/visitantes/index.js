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
          return crachas.filter(function (c) {return c.sentido === 'entrada';})
          .map(function (c) {
            return {
              id: c.id,
              cracha: c.Cracha.nome,
              tipoDoc: c.Pessoa.Doc.descricao,
              doc: c.Pessoa.documento,
              nome: c.Pessoa.nome,
              momento: $filter('date')(new Date(c.momento),'short', '-0300'),
              crachaId: c.Cracha.id,
              pessoaId: c.Pessoa.id
            };
          });
        });
      }
    }
  });
})
.controller('VisitantesCtrl', function ($scope, $state, $stateParams, $filter, DB, Visitantes) {
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
    var P = null;
    var C = null;
    var V = $scope.visitantes.filter(function (v) {
      return v.id == id;
    })[0];
    var saida = DB.model.Registro.build({
      momento: new Date(),
      sentido: 'saida'
    });
    DB.model.Pessoa.findOne({ where: { id: V.pessoaId }})
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
    .then(function () {
      $state.transitionTo($state.current, $stateParams, trOptions);
    })
    .catch(function (e) {
      window.alert('Desculpe, ocorreu um erro.');
      console.error('Erro: ', e);
    });
  }; // $state.transitionTo($state.current, $stateParams, trOptions);
});
