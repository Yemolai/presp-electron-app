angular.module('presp.home', ['presp'])
.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('home', {
    url: '/home',
    templateUrl: 'modules/home/home.html',
    controller: 'homeCtrl',
    resolve: {
      Docs: function (DB) {
        return DB.listAll(DB.model.Doc, {
          attributes: ['id', 'descricao'],
          raw: true
        });
      },
      RegistrosCrachas: function (DB) {
        return DB.getCrachas()
        .filter(function (cracha) {
          return cracha.sentido == 'saida';
        })
        .then(function(crachas) {
          return crachas;
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
  var selectedRegisteredPerson = false;
  var PersonId = 0;
  $scope.title = 'Registrar entrada';
  $scope.nome = '';
  $scope.tipoDoc = Docs[0] || { id: 0 };
  $scope.cracha = RegistrosCrachas[0] || { id: 0 };
  $scope.documento = '';
  $scope.module_static = MODULE_DIR + 'static/';
  $scope.showDoneAlert = false;
  $scope.showErrorAlert = false;
  $scope.tiposDoc = Docs;
  $scope.crachas = RegistrosCrachas;
  console.warn(RegistrosCrachas);
  $scope.editable = false;
  $scope.registrando = false;
  $scope.mensagem = {
    on: false,
    level: 'success',
    text: 'Registrando'
  };

  /**
   * Função para registrar novo fluxo de pessoa
   * @return {void}
   */
  $scope.register = function () {
    // se não há dados não é possível registrar
    if ($scope.registrando) {
      console.error('ERROR! Already registering!');
      return 1;
    }
    $scope.registrando = true; // para bloquear múltiplos registros
    // testes de variáveis
    var invalidName = $scope.nome === '';
    var invalidDoc = $scope.documento === '';
    var invalidTipoDoc = !('id' in $scope.tipoDoc) || $scope.tipoDoc.id === 0;
    var invalidCracha = !('crachaId' in $scope.cracha) || $scope.cracha.crachaId === 0;
    console.warn('invalidName', invalidName);
    console.warn('invalidDoc', invalidDoc);
    console.warn('invalidTipoDoc', invalidTipoDoc);
    console.warn('invalidCracha', invalidCracha);
    // se algum teste falhar, cancele
    if (invalidName || invalidDoc || invalidTipoDoc || invalidCracha) {
      $scope.mensagem.level = 'warning';
      $scope.mensagem.text = 'Preencha todos os campos corretamente';
      $scope.mensagem.on = true;
      $scope.registrando = false;
      return 0; // finalize execução
    }
    if (!((/[\D\s]+/).test($scope.nome))) {
      console.warn($scope.nome);
      console.warn((/[\D\s]+/).test($scope.nome));
      $scope.mensagem.level = 'warning';
      $scope.mensagem.text = 'Nome não deve conter números';
      $scope.mensagem.on = true;
      $scope.registrando = false;
      return 0; // finalize execução
    }
    if (!((/[\d]+/).test($scope.documento))) {
      console.warn($scope.documento);
      console.warn((/[\d]+/).test($scope.documento));
      $scope.mensagem.level = 'warning';
      $scope.mensagem.text = 'Documento de identificação deve conter apenas números';
      $scope.mensagem.on = true;
      $scope.registrando = false;
      return 0; // finalize execução
    }
    var associations = [];
    // TODO show loading spinning wheel
    var searchConditionsForPessoa = (selectedRegisteredPerson) ? {
      where: { id: PersonId }
    } : {
      where: { $or: [{ nome: $scope.nome }, { documento: $scope.documento }]}
    };
    searchConditionsForPessoa.include = [{model: DB.model.Doc}];

    $scope.mensagem.on = false;
    $scope.mensagem.level = 'warning';
    $scope.mensagem.text = 'Registrando...';

    DB.model.Pessoa.findOne(searchConditionsForPessoa) // encontre a pessoa
    .then(function (pessoa) {
      if (pessoa === null) {
        return DB.model.Pessoa.create({
          nome: $scope.nome,
          documento: $scope.documento
        }).then(function (pessoa) {
          return DB.model.Doc.findOne({where: { id: $scope.tipoDoc.id }})
          .then(function (doc) {
            pessoa.setDoc(doc);
            return { 'Pessoa': pessoa };
          });
        });
      }
      var DoctypeMatch = pessoa.Doc.id === $scope.tipoDoc.id;
      var DocNumberMatch = pessoa.documento === $scope.documento;
      if (DoctypeMatch && DocNumberMatch) {
        return DB.model.Registro.findAll({
          order: [['momento', 'DESC']],
          group: ['PessoaId'],
          where: {
            PessoaId: pessoa.id
          }
        }).then(function (registros) {
          console.warn(registros);
          if (registros === null ||
            registros.length < 1 ||
            !('sentido' in registros[0]) ||
            registros[0].sentido === 'saida') {
            return { Pessoa: pessoa };
          }
          $scope.mensagem = {
            on: true,
            level: 'danger',
            text: 'Esta pessoa não teve sua saída registrada'
          };
          var e = {message: 'Último registro de ' + pessoa.nome + ' não é de saída.'};
          $state.transitionTo($state.current, $stateParams, {
            reload: true, inherit: false, notify: true
          });
          throw e;
        });
      }
      window.alert('Documento informado é diferente do registrado para ' + pessoa.nome);
      var error_dump = {
        message: 'WRONG_DOCUMENT_ERROR',
        tipoDoc: {
          informado: $scope.tipoDoc,
          registrado: pessoa.Doc
        },
        doc: {
          informado: $scope.documento,
          registrado: pessoa.documento
        }
      };
      throw error_dump;
    }).then(function (data) {
      if (data === null) {
        var e = {message: 'erro, pessoa indisponível'};
        throw e;
      }
      return DB.model.Cracha.findOne({where: {id: $scope.cracha.crachaId }})
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
        // TODO hide loading spinning wheel
        window.alert('Registrado');
        $state.transitionTo($state.current, $stateParams, {
          reload: true, inherit: false, notify: true
        });
      });
    })
    .catch(function (err) {
      console.error('Error: ', err);
      window.alert('Erro: ' + err.message);
      $state.transitionTo($state.current, $stateParams, {
        reload: true, inherit: false, notify: true
      });
    });
    // encontre o tipo de documento escolhido
  };// end scope.register

  // incluir typeahead pro documento de pessoa
  $scope.getPessoas = function (q) {
    selectedRegisteredPerson = false;
    $scope.editable = true;
    $scope.documento = '';
    $scope.tipoDoc = Docs[0];
    return DB.model.Pessoa.findAll({
      attributes: ['id', 'nome', 'documento'],
      where: {
        $or: [
          {nome: {$like: '%' + q }},
          {nome: {$like: '%' + q + '%' }},
          {nome: {$like: q + '%' }}
        ]
      },
      include: [
        { model: DB.model.Doc, attributes: ['id'], raw: true}
      ]
    })
    .then(function (PessoasList) {
      return PessoasList.map(function (p) {
        return p.get();
      });
    })
    .catch(function (e) {
      console.error('Algo deu errado ao procurar pessoa: ', e);
    });
  }; // function getPessoas end

  $scope.selectPessoa= function (pessoa) {
    selectedRegisteredPerson = true;
    PersonId = pessoa.id;
    $scope.editable = false;
    $scope.documento = pessoa.documento;
    $scope.tipoDoc = Docs.filter(function (doc) { return doc.id == pessoa.Doc.id; })[0];
  };
});
