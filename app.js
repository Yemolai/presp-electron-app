/**
 * Módulo principal do aplicativo
 * Aglutina os demais módulos e inicializa o sistema
 */
angular.module('presp', [
  'ui.router', // router
  'ui.bootstrap', // angular UI bootstrap directives
  'presp.database', // banco de dados
  'presp.home', // página principal
  'presp.pessoas', // lista de pessoas
  'presp.visitantes', // lista de visitantes
  'presp.crachas', // lista de crachás
  'presp.list', // listagem de fluxo
  'presp.export', // exportação de dados
  'presp.abouthelp' // sobre/ajuda
]);
