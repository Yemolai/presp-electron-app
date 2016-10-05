angular.module('presp.home', ['presp'])
.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('home', {
    url: '/home',
    templateUrl: 'modules/home/home.html',
    controller: 'homeCtrl',
    resolve: {
      Docs: function (DB) {
        return DB.listAll(DB.model.Doc, {attributes: ['id', 'descricao']});
      },
      Crachas: function (DB) {
        return DB.listAll(DB.model.Cracha, {attributes: ['id', 'nome']});
      }
    }
  });
  // Para qualquer outra URL, redirecionar para /home
  $urlRouterProvider.otherwise('/home');
})
// Controller da Página inicial
.controller('homeCtrl', function ($scope, $state, DB, Docs, Crachas) {
  var MODULE_DIR = 'modules/home/';
  $scope.form = {};
  $scope.title = 'Registrar';
  $scope.nome = '';
  $scope.tipoDoc = 0;
  $scope.cracha = 0;
  $scope.documento = '';
  $scope.movimento = false;
  $scope.module_static = MODULE_DIR + 'static/';
  $scope.showDoneAlert = false;
  $scope.showErrorAlert = false;
  $scope.setEntrada = function () { $scope.movimento = false; };
  $scope.setSaida = function () { $scope.movimento = true; };
  $scope.tiposDoc = Docs;
  $scope.crachas = Crachas;

  /**
   * Funções de exibição de mensagens ao usuário
   * @type {Object}
   */
  var message = {
    /** @type {int} timeout em milissegundos para sumir a mensagem */
    timeout: 2000,
    /**
     * Mostrar mensagem de alerta.
     * @return {undefined}
     */
    error: function () { // mostrar alerta de erro
      $scope.showErrorAlert = true;
      setTimeout(function () { $scope.showErrorAlert = false; }, message.timeout);
    },
    /**
     * Mostrar mensagem de sucesso.
     * @return {undefined}
     */
    success: function () { // mostrar alerta de sucesso
      $scope.showDoneAlert = true;
      setTimeout(function () { $scope.showDoneAlert = false; }, message.timeout);
    }
  };

  /**
   * Função para registrar novo fluxo de pessoa
   * @return {void}
   */
  $scope.register = function () {
    // se não há dados não é possível registrar
    if ($scope.nome === '' || $scope.documento === '' || $scope.tipoDoc === '') {
      return 0; // finalize execução
    }
    var newRegistryData = {
      sentido: ($scope.sentido === false) ? 'entrada':'saida',
    };
    var associations = [];
    // TODO show loading spinning wheel
    DB.model.Pessoa.findOne({
      where: { $or: [{ nome: $scope.nome }, { documento: $scope.documento }]}
    }).then(function (pessoa) {
      if (pessoa === null) {
        return DB.model.Pessoa.create({
          nome: $scope.nome,
          documento: $scope.documento
        }).then(function (pessoa) {
          DB.model.Doc.findOne({where: { id: $scope.tipoDoc }})
          .then(function (doc) {
            pessoa.setDoc(doc);
            return { 'Pessoa': pessoa };
          });
        });
      }
        return {'Pessoa': pessoa };
    }).then(function (data) {
      return DB.model.Cracha.findOne({where: {id: $scope.cracha }})
      .then(function (cracha) {
        if (cracha === null) {
          var error = {
            error: true,
            message: 'crachá '+$scope.cracha+' não encontrado'
          };
          throw error;
        } else {
          data.Cracha = cracha;
          return data;
        }
      }).then(function (data) {
        return DB.model.Registro.create(newRegistryData)
        .then(function (registro) {
          if (registro === null) {
            var error = {
              error: true,
              message: 'Erro ao cadastrar novo registro com os dados.',
              data: newRegistryData
            };
            throw error;
          } else {
            data.Registro = registro;
            return data;
          }
        });
      }).then(function (data) {
        associations = [
          data.Registro.setCracha(data.Cracha),
          data.Registro.setPessoa(data.Pessoa)
        ];
        return associations;
      }).all(associations)
      .then(function () {
        console.warn('Registered');
        // TODO hide loading spinning wheel
      });
    });
    // encontre o tipo de documento escolhido
  };// end scope.register

});
