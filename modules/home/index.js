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
    if ($scope.nome === '' || $scope.documento === '' || $scope.tipoDoc === '')
      return 0; // finalize execução
    var wherePessoa = { // condição de bsuca de pessoa no banco de dados
      where: {
        nome: $scope.nome,
        documento: $scope.documento
      }
    },
    newRegistryData = { sentido: ($scope.sentido === false) ? 'entrada':'saida'};
    // encontre o tipo de documento escolhido
    DB.model.Doc.findById($scope.tipoDoc).then(function (Doc) {
      return DB.model.Pessoa.findOrCreate(wherePessoa).then(function (Pessoa) {
        // TODO Salvar Registro: se pessoa existe, verifica documento, cancela se não bater, se não existe, crie.
        Pessoa[0].setDoc(Doc); // definir a primeira pessoa encontrada com o tipo de documento definido
        // Vai criar novo registro
        return DB.model.Registro.create(newRegistryData).then(function (Registro) {
          // Vai criar atribuir nova pessoa ao registro
          return Registro.setPessoa(Pessoa[0]).then(function() {
            return DB.conn.sync().then(function () {
              $state.reload(true);
              return 1;
            }) // fim sync
            .catch(function (err) {
              if (err) {
                console.error('Erro ao sincronizar: ' + err);
                message.error();
              }
            }); // fim sync error catch
          }) // fim set Pessoa
          .catch(function (err) {
            if (err) {
              console.error('Erro ao definir pessoa: ' + err);
              message.error();
            }
          }); // fim do set Pessoa catch error
        }) // create Registro
        .catch(function (err) {
          if (err) {
            console.error('Erro ao criar registro' + err);
            message.error();
          }
        }); // fim do create registro catch error
      })  // find or create Pessoa
      .catch(function (err) {
        if (err) {
          console.error('Erro ao bucar/criar pessoa: ' + err);
          message.error();
        }
      });  // fim do find/create Pessoa catch error
    }) // find tipoDoc
    .catch(function (err) {
      if (err) {
        console.error('Erro ao buscar tipo de documento: ' + err);
        message.error();
      }
    });  // fim do find tipoDoc catch error
  };// end scope.register

});
