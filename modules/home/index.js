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
      RegistrosCrachas: function (DB) {
        /*
        Esta função recupera os últimos registros existentes que que foram
        registrados como saídas e seus respectivos crachás para listá-los como
        crachás disponíveis mas ainda é necessário uma lista dos crachás e um
        filtro para que, no caso da tabela de registros estiver vazia ou não
        tiver uso de um crachá, esta lista também não se torne falha tendo
        nenhum crachá ou não tendo crachás que não foram usados ao menos uma vez
        */
        return DB.model.Registro.findAll({
          attributes: [ // atributos da tabela a serem requisitados
            'CrachaId',
            'sentido'
          ],
          where: { // condição "onde o id de crachá não for nulo"
            CrachaId: { // TODO definir cracha como required no modelo Registro
              $ne: null // not-equal null
            }
          },
          include: [{ model: DB.model.Cracha, attributes: ['id', 'nome'] }],
          group: ['CrachaId'], // ignora demais linhas com CrachaId redundante
          order: [['createdAt', 'DESC']] // organiza pelos mais recentes
        }) // fim da query
        .then(function (crachas) { // manipulação do resultado
          var visit = {};
          for (var id in crachas) {
            if (crachas[id].sentido == 'saida') {
              visit[id] = crachas[id];
            }
          }
          console.warn('visit: ', visit);
          return visit;
        });
      }
    }
  });
  // Para qualquer outra URL, redirecionar para /home
  $urlRouterProvider.otherwise('/home');
})
// Controller da Página inicial
.controller('homeCtrl', function ($scope, $state, $stateParams, DB, Docs, RegistrosCrachas) {
  var MODULE_DIR = 'modules/home/';
  $scope.form = {};
  $scope.title = 'Registrar entrada';
  $scope.nome = '';
  $scope.tipoDoc = 0;
  $scope.cracha = 0;
  $scope.documento = '';
  $scope.movimento = false;
  $scope.module_static = MODULE_DIR + 'static/';
  $scope.showDoneAlert = false;
  $scope.showErrorAlert = false;
  $scope.tiposDoc = Docs;
  $scope.registros = RegistrosCrachas;

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
            message: 'crachá ' + $scope.cracha + ' não encontrado'
          };
          throw error;
        } else {
          data.Cracha = cracha;
          return data;
        }
      }).then(function (data) {
        return DB.model.Registro.create({sentido: 'entrada'})
        .then(function (registro) {
          if (registro === null) {
            var error = {
              error: true,
              message: 'Erro ao cadastrar novo registro de entrada.',
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
        $state.transitionTo($state.current, $stateParams, {
          reload: true, inherit: false, notify: true
        });
      });
    });
    // encontre o tipo de documento escolhido
  };// end scope.register

});
