angular.module('presp.crachas', ['presp', 'angularModalService'])
.config(function ($stateProvider) {
  $stateProvider
  .state('crachas', {
    url: '/crachas',
    templateUrl: 'modules/crachas/crachas.html',
    controller: 'CrachasCtrl',
    resolve: {
      Crachas: function (DB, $filter) {
        return DB.model.Cracha.findAll() // busque os registros de Crachá
        .then(function (crachas) { // de posse dos crachás, faça outra busca
          return DB.model.Registro.findAll({ // busque os registros en e/s
            attributes: [ // atributos da tabela a serem requisitados
              'CrachaId', // pra cruzar dados
              'sentido', // pra definir se está ou não disponível
              'momento' // pra definir quando foi o último uso
            ],
            where: { // condição "onde o id de crachá não for nulo"
              CrachaId: {
                $ne: null // not-equal null
              }
            },
            group: ['CrachaId'], // ignora demais linhas com CrachaId redundante
            order: [['createdAt', 'DESC']] // organiza pelos mais recentes
            // consequentemente o group+order aqui lista apenas o registro mais
            // recente de cada crachá
          })
          .then(function (registros) { // e então vamos agregar num só objeto
            return { C: crachas, R: registros }; // pra não perder dados
          }); // este then é só pra unir dados e jogar pro then seguinte
        }) // pra ficar mais simples de ler, usar 'data' que tem C e R
        .then(function (data) {
          for (var n in data.C) { // default values
            data.C[n].disponivel = true; // todos disponíveis até que se prove o contrário
            data.C[n].ultimoUso = 'Não usado'; // todos são virgens até que se prove o contrário
          }
          for (var i in data.R) { // para cada registro encontrado
            var id = data.R[i].get('CrachaId'); // use o id de crachá
            for (var j in data.C) { // (aqui que a gente prova o contrário)
              if (data.C[j].id == id) { // pra encontrar o crachá atribuido
                if (data.R[i].get('sentido') === 'entrada') { // se é de entrada
                  data.C[j].disponivel = false; // defina que crachá está em uso
                }
                // se existe registro, já foi usado alguma vez, atribua 'quando'
                data.C[j].ultimoUso = $filter('date')(data.R[i].momento, 'medium');
              }
            }
          }
          return data.C;
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
      console.warn('Modal was closed. Result: ', result);
      $state.transitionTo($state.current, $stateParams, {
        reload: true, inherit: false, notify: true
      });
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
      console.warn('Crachá criado:', Cracha);
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
