/* global angular */
angular.module('presp.export', ['presp', 'ngFileSaver'])
.config(function ($stateProvider) {
  $stateProvider
    .state('export', {
      url: '/export',
      templateUrl: 'modules/export/export.html',
      controller: 'exportCtrl'
    });
})
// EXPORT CONTROLLER
.controller('exportCtrl', function (DB, $q, $filter, $location, $scope, $state, FileSaver, Blob) {

  $scope.title = 'Exportação de dados';

  $scope.clearLDB = function () {
    var confirma = confirm('Apagar todo o banco de dados? Tem certeza?');
    if (confirma) {
      DB.conn.dropAllSchemas({logging: false}).then(function () {
        DB.conn.sync().then(function () {
          window.alert('O banco de dados inteiro foi apagado');
          $location.path('/');
        }).catch(function (err) {
          if (err) {
            console.error('Erro ao resincronizar o banco de dados: ' + err);
          }
        });
      }).catch(function (err) {
        if (err) {
          console.error('Erro ao destruir banco de dados: ' + err);
        }
      });
    } else {
      window.alert('Operação cancelada. O banco de dados não foi alterado.');
    }
  };// fim clearDB

  $scope.exportJSON = function () {
    DB.export(function (dbJson) {
      var stringJSON = JSON.stringify(dbJson);
      var data = new Blob([stringJSON],
        { type: 'application/json;charset=utf-8' });
      FileSaver.saveAs(data, 'PRESPdata.json', true);
      $state.go('export');
    });
  }; // exportJSON

  $scope.exportTXT = function () {
    DB.export(function (output) {
      var txt = 'Exportação de dados em TXT\r\n';
      for (var i in output) {
        txt+='Tabela ' + i + '\r\n';
        var table = output[i];
        for (var j in table) {
          var line = table[j];
          var rowData = [];
          for (var k in line) {
            rowData.push(k + ': ' + line[k]);
          }
          txt+=rowData.join(', ') + '\r\n';
        }
        txt+='\r\n';
      }
      var data = new Blob([txt], { type: 'text/plain;charset=utf-8' });
      FileSaver.saveAs(data, 'PRESPdata.txt', true);
      $state.go('export');
    });
  }; //exportTXT

  // $scope.exportCSV = function () {
  //   var separator = ',';
  //   DB.export(function (dbJson) {
  //     var csv = '';
  //     var tables = [];
  //     console.warn('Initializing CSV Export');
  //     console.warn('raw data: ', dbJson);
  //     for (var i in dbJson) {
  //       console.warn('Treating table ' + i);
  //       var table = dbJson[i];
  //       var lines = [];
  //       for (var n in table) {
  //         var linha = table[n];
  //         var lineData = [];
  //         var headers = Object.keys(linha);
  //         //csv += headers.join(',') + '\r\n';
  //         for (var o in headers) {
  //           var header = headers[o];
  //           if (header in linha) {
  //             lineData.push(linha[header]);
  //           } else {
  //             lineData.push('');
  //           }
  //         }
  //         lines.push(lineData.join(separator));
  //       }
  //     }
  //     console.warn('output string:', csv);
  //     var data = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  //     FileSaver.saveAs(data, 'PRESPdata.csv', true);
  //     $state.go('export');
  //   });
  // };//exportCSV

});
