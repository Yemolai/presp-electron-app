angular.module('presp.crachas', ['presp', 'angularModalService'])
.config(function ($stateProvider) {
  $stateProvider
  .state('crachas', {
    url: '/crachas',
    templateUrl: 'modules/crachas/crachas.html',
    controller: 'CrachasCtrl',
    resolve: {
      Crachas: function (DB, $filter) {
        return DB.getCrachas()
        .map(function (cracha) {
          cracha.disponivel = cracha.sentido === 'saida';
          cracha.momento = $filter('date')(cracha.momento, 'short', '-0300');
          return cracha;
        })
        .then(function (crachas) {
          return crachas;
        });
      }
    }
  });
})
.controller('CrachasCtrl', function ($scope, $state, $stateParams, ModalService, Crachas) {
  $scope.crachas = Crachas;
  $scope.novoCracha = function () {
    ModalService.showModal({
      templateUrl: 'modules/crachas/novoCrachaModal.html',
      controller: 'novoCrachaModalCtrl'
    }).then(function (modal) {
      modal.element.modal();
      return modal.close;
    }).then(function (result) {
      if (result === null) {
        var e = { message: 'Erro no modal' };
        throw e;
      }
      $state.transitionTo($state.current, $stateParams, {
        reload: true, inherit: false, notify: true
      });
    })
    .catch(function (e) {
      console.error('Erro! ', e);
      window.alert('Erro: ' + e.message);
    });
  };
})
.controller('novoCrachaModalCtrl', function ($scope, $element, close, DB) {
  var modalAnimDelay = 200;
  $scope.title = 'Adicionar novo crachá';
  $scope.description_text = 'Para adicionar um novo crachá, nomeie-o.';
  $scope.name_placeholder = 'Visitante 5';
  $scope.nome = '';
  $scope.save = function () {
    if ($scope.nome.length < 1) {
      window.alert('Não deixe o campo em branco');
      $element.modal('show');
      return true;
    }
    DB.model.Cracha.create({
      nome: $scope.nome
    }).then(function (Cracha) {
      $element.modal('hide');
      close({ cracha: Cracha }, modalAnimDelay);
    }).catch(function (err) {
      console.error('Houve um erro: ', err);
      window.alert('Erro: ' + err.message);
    });
  };
  $scope.cancel = function () {
    $element.modal('hide');
    close({ cracha: null }, modalAnimDelay);
  };
});
