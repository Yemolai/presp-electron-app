// Módulo Export
angular.module('presp.export', ['presp'])
.config(function ($stateProvider) {
  $stateProvider
    .state('export', {
      url: "/export",
      templateUrl: "modules/export/export.html",
      controller: "exportCtrl"
    });
})
// EXPORT CONTROLLER
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
