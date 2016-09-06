var App = angular.module('presp', [
  'ui.router',
  'presp.database',
  'presp.home',
  'presp.list',
  'presp.export',
  'presp.abouthelp'
])
.config(function ($urlRouterProvider) {
  // Para qualquer outra URL, redirecionar para /home
  $urlRouterProvider.otherwise("/home");
})
