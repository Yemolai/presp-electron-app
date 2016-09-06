// Constantes globais
const URL_REPO = "https://github.com/Yemolai/presp-electron-app";
const SHELL = require('electron').shell;

angular.module('presp.abouthelp', ['presp'])
.config(function ($stateProvider) {
  $stateProvider
  .state('help', {
    url: "/help",
    templateUrl: "modules/abouthelp/help.html",
    controller: "helpCtrl"
  }).state('about', {
    url: "/about",
    templateUrl: "modules/abouthelp/about.html",
    controller: "aboutCtrl"
  })
})
.controller('helpCtrl', function ($scope) {
  $scope.openRepo = function () {
    SHELL.openExternal(URL_REPO);
  }
})
.controller('aboutCtrl', function ($scope) {
  $scope.openRepo = function () {
    SHELL.openExternal(URL_REPO);
  };
});
