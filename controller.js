// Globais
var urlRepo = "https://github.com/Yemolai/presp-electron-app";
const shell = require('electron').shell;
var doc = [];
doc[1] = "CPF";
doc[2] = "RG";
doc[3] = "CNH";
doc[4] = "PIS/PASEP";
// Angular application
angular.module('presp.controller', ['ngFileSaver'])
  .config(function ($stateProvider, $urlRouterProvider) {
    // Para qualquer outra URL, redirecionar para /home
    $urlRouterProvider.otherwise("/");

    // Estados para roteamento de URLs
    $stateProvider
      .state('home', {
        url: "/",
        templateUrl: "templates/home.html",
        controller: "homeCtrl"
      })
      .state('list', {
        url: "/list",
        templateUrl: "templates/list.html",
        controller: "listCtrl"
      })
      .state('export', {
        url: "/export",
        templateUrl: "templates/export.html",
        controller: "exportCtrl"
      }).state('help', {
        url: "/help",
        templateUrl: "templates/help.html",
        controller: "helpCtrl"
      }).state('about', {
        url: "/about",
        templateUrl: "templates/about.html",
        controller: "aboutCtrl"
      });
  })
  .controller('homeCtrl', function ($scope) {
    $scope.form = {};
    $scope.title = "Registrar";
    $scope.nome = "";
    $scope.tipoDoc = 0;
    $scope.documento = "";
    $scope.movimento = true;
    $scope.showDoneAlert = false;
    $scope.showErrorAlert = false;

    $scope.setEntrada = function () { $scope.movimento = true };
    $scope.setSaida = function () { $scope.movimento = false };

    $scope["tiposDoc"] = [
      {"id": 1, "text": doc[1]},
      {"id": 2, "text": doc[2]},
      {"id": 3, "text": doc[3]},
      {"id": 4, "text": doc[4]}
    ];

    var stringPessoas = localStorage.getItem('pessoas');
    var pessoas = JSON.parse(stringPessoas || "[]");
    $scope.pessoas = pessoas;

    $scope.addPessoa = function () {
      msgTimeout = 2000;
      if ($scope['nome']=="" || $scope['documento']=="" || $scope['tipoDoc']==0) {
        $scope['showErrorAlert'] = true;
        setTimeout(function () { $scope['showErrorAlert'] = false; }, msgTimeout);
      } else {
        pessoas.push({
          "nome": $scope.nome,
          "tipoDoc": $scope.tipoDoc,
          "documento": $scope.documento,
          "in": $scope.movimento,
          "timestamp": Date.now()
        });
        localStorage.setItem('pessoas', JSON.stringify(pessoas));
        $scope.form.pessoa.$setPristine();
        $scope.form.pessoa.$setUntouched();
        $scope.nome = $scope.documento = "";
        $scope.tipoDoc = 0;
        $scope.showDoneAlert = true;
        $scope.movimento = true;
        setTimeout(function () { $scope.showDoneAlert = false; }, msgTimeout);
      }// if nome||documento||tipoDoc
    }

  })
  .controller('listCtrl', function ($scope, $filter) {
    $scope.title = "Lista de registros";
    var stringPessoas = localStorage.getItem('pessoas');
    var pessoas = JSON.parse(stringPessoas || "[]");
    $scope.pessoas = pessoas;
    $scope.searchText = "";
    $scope['doc'] = doc;

    function novamente(uuid, movimento) {
      var pessoa = $filter('filter')(pessoas, {timestamp: uuid}, true)[0];
      pessoas.push({
        "nome": pessoa.nome,
        "tipoDoc": pessoa.tipoDoc,
        "documento": pessoa.documento,
        "in": movimento,
        "timestamp": Date.now()
      });
      localStorage.setItem('pessoas', JSON.stringify(pessoas));
    }

    $scope.entrada = function (timestamp) {
      novamente(timestamp, true);
    }

    $scope.saida = function (timestamp) {
      novamente(timestamp, false);
    }

  })
  .controller('exportCtrl', function ($scope, $filter, $state, FileSaver, Blob) {

    $scope.title = "Exportação de dados";

    $scope.clearLDB = function () {
      var confirma = confirm("Apagar todo o banco de dados? Tem certeza?");
      if (confirma) {
        localStorage.setItem('pessoas', "[]");
        window.alert("O banco de dados foi apagado.")
      } else {
        window.alert("Operação cancelada. O banco de dados não foi alterado.")
      }
    }// fim clearDB

    $scope.exportJSON = function () {
      var stringPessoas = localStorage.getItem('pessoas') || "[]";
      var pessoas = JSON.parse(stringPessoas);
      if (pessoas.length == 0) {
        alert("Banco de dados está vazio ou corrompido");
        return 0;
      }
      var data = new Blob([stringPessoas],
        { type: 'application/json;charset=utf-8' });
      FileSaver.saveAs(data, 'PRESPdata.json', true);
      $state.go("export");
    }; // exportJSON

    $scope.exportTXT = function () {
      var stringPessoas = localStorage.getItem('pessoas') || "[]";
      var pessoas = JSON.parse(stringPessoas);
      if (pessoas.length == 0) {
        alert("Banco de dados está vazio ou corrompido");
        return 0;
      }
      var txt = "Relatório de entrada e saída gerado em " +
      $filter('date')(Date.now(), 'medium');
      angular.forEach(pessoas, function (P, key) {
        txt+="\r\n" +
        ((P.in) ? "entrada" : "saida") + " às " +
        $filter('date')(P.timestamp, 'short') + " de " +
        P.nome + " (" +
        doc[P.tipoDoc] + " " +
        P.documento + ")";
      });
      var data = new Blob([txt], { type: 'text/plain;charset=utf-8' });
      FileSaver.saveAs(data, 'PRESPdata.txt', true);
      $state.go("export");
    }; //exportTXT

    $scope.exportCSV = function () {
      var stringPessoas = localStorage.getItem('pessoas') || "[]";
      var pessoas = JSON.parse(stringPessoas);
      if (pessoas.length == 0) {
        alert("Banco de dados está vazio ou corrompido");
        return 0;
      }
      var csv = "hora;nome;tipo de documento;número documento;entrada/saida";
      angular.forEach(pessoas, function (P, key) {
        csv+="\r\n" +
        $filter('date')(P.timestamp, 'short') + ";" +
        P.nome + ";" +
        doc[P.tipoDoc] + ";" +
        P.documento + ";" +
        ((P.in) ? "entrada" : "saida");
      });
      var data = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      FileSaver.saveAs(data, 'PRESPdata.csv', true);
      $state.go("export");
    };//exportCSV

  })
  .controller('helpCtrl', function ($scope) {
    $scope.openRepo = function () {
      shell.openExternal(urlRepo);
    }
  })
  .controller('aboutCtrl', function ($scope) {
    $scope.openRepo = function () {
      shell.openExternal(urlRepo);
    }
  });
