angular.module('presp.home', ['presp'])
.config(function ($stateProvider) {
  $stateProvider
  .state('home', {
    url: "/home",
    templateUrl: "modules/home/home.html",
    controller: "homeCtrl"
  })
})
// Controller da Página inicial
.controller('homeCtrl', function ($scope, DB) {
  const MODULE_DIR = 'modules/home/';
  $scope.form = {};
  $scope.title = "Registrar";
  $scope.nome = "";
  $scope.tipoDoc = 0;
  $scope.documento = "";
  $scope.movimento = false;
  $scope.module_static = MODULE_DIR + "static/";
  $scope.showDoneAlert = false;
  $scope.showErrorAlert = false;
  $scope.tipoDocPopulated = false;
  $scope.setEntrada = function () { $scope.movimento = false };
  $scope.setSaida = function () { $scope.movimento = true };
  $scope.tiposDoc = [];

  // Início da requisição de tipos de documento do banco de dados
  DB.model.TipoDoc.findAll().then(function (tipos) {
    // aplicar $digest após a execução da seguinte função
    $scope.$apply(function () {
      // para cada tipo, adicione-o ao objeto do escopo
      for (var tipoID in tipos) {
        $scope.tiposDoc.push({
          "id": tipos[tipoID].get('id'),
          "text": tipos[tipoID].get('descricao')
          })
      }
      // troque o valor do flag pra sumir o spinner e surgir o select
      $scope.tipoDocPopulated = true;
    })
  });

  var msgTimeout = 2000;

  function showErrorAlert() { // mostrar alerta de erro
    $scope.showErrorAlert = true;
    setTimeout(function () { $scope.showErrorAlert = false; }, msgTimeout);
  }

  function showSuccessMessage() { // mostrar alerta de sucesso
    $scope.showDoneAlert = true;
    setTimeout(function () { $scope.showDoneAlert = false; }, msgTimeout);
  }

  $scope.register = function () {
    // se não há dados não é possível registrar
    if ($scope.nome == '' || $scope.documento == '' || $scope.tipoDoc == '')
      return 0; // finalize execução
    var _tipodoc, _pessoa,
    wherePessoa = { // condição de bsuca de pessoa no banco de dados
      where: {
        nome: $scope.nome,
        documento: $scope.documento
      }
    },
    newRegistryData = { sentido: ($scope.sentido == false) ? 'entrada':'saida'};
    // encontre o tipo de documento escolhido
    DB.model.TipoDoc.findById($scope.tipoDoc).then(function (TipoDoc) {
      console.log('TipoDoc encontrado: ', TipoDoc);
      return DB.model.Pessoa.findOrCreate(wherePessoa)
      .then(function (Pessoa, created) {
        Pessoa[0].setTipoDoc(TipoDoc);
        return DB.model.Registro.create(newRegistryData)
        .then(function (Registro, created) {
          return Registro.setPessoa(Pessoa[0])
          .then(function() {
            return DB.conn.sync()
            .then(function () {
              $scope.$apply(function () {
                $scope.form.pessoa.$setPristine();
                $scope.form.pessoa.$setUntouched();
                $scope.nome = $scope.documento = "";
                $scope.tipoDoc = 0;
                $scope.movimento = true;
                showSuccessMessage();
              })
              return 1;
            }); // final return promise
          }); // sequelize Sync
        }); // create Registro
      }); // find or create Pessoa
    }); // find tipoDoc
  }// end scope.register

})
