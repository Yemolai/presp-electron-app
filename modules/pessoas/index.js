angular.module('presp.pessoas', ['presp', 'presp.database'])
.config(function ($stateProvider) {
  $stateProvider
  .state('pessoas', {
    url: '/pessoas',
    templateUrl: 'modules/pessoas/pessoas.html',
    controller: 'PessoasCtrl',
    cache: false,
    resolve: {
      Pessoas: function ($filter, DB) {
        return DB.model.Pessoa.findAll({
          attributes: ['id', 'nome', 'documento'],
          include: [
            {
              model: DB.model.Doc,
              attributes: ['id','descricao']
            }
          ]
        })
        .then(function (pessoas) {
          var P = pessoas.map(function (pessoa) {
            var p = {
              id: pessoa.id,
              nome: pessoa.nome,
              docId: pessoa.Doc.id,
              tipoDocumento: pessoa.Doc.descricao,
              documento: pessoa.documento
            };
            return p;
          });
          return P;
        })
        .catch(function (e) {
          window.alert('Desculpe, ocorreu um erro. Detalhes: ' + e.message);
          return [];
        });
      }
    }
  });
})
.controller('PessoasCtrl', function (Pessoas, DB, $scope) {
  $scope.pessoas = function (page) {
    if (page === 'length') {
      return Pessoas.length;
    }
    var start = page * 10;
    var end = start + 10;
    if (end > Pessoas.length) {
      return Pessoas.slice(start);
    }
    return Pessoas.slice(start, end);
  };
  $scope.pessoasLength = Pessoas.length;
  $scope.page = 0;
  $scope.inRange = function (index) {
    return (index > $scope.page-5) && (index < $scope.page+5);
  };
  $scope.delete = function (id) {
    // função para apagar pessoa
    // TODO adicionar screen blocking modal before delete
    DB.model.Pessoa.findOne({'where': {'id': id}})
    .then(function (pessoa) {
      if (pessoa === null) {
        var erro = {message: 'Pessoa ' + id + ' não encontrada.'};
        throw erro;
      }
      var nome = pessoa.nome;
      return pessoa.destroy()
      .then(function () {
        return nome;
      });
    })
    .then(function (nome) {
      // TODO remover blocking MODAL
      window.alert('Registro de \''+nome+'\' foi apagado.');
    });
  };
  // TODO adicionar modal para editar Pessoa
})
.controller('editPessoaCtrl', function ($scope) {
  $scope.nome = '';
  $scope.tipoDoc = 0;
  $scope.documento = '';
});
