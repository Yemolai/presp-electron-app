/**
 * Módulo principal do aplicativo
 * Aglutina os demais módulos e inicializa o sistema
 */
angular.module('presp', [
  'ui.router', // router
  'presp.database', // banco de dados
  'presp.home', // página principal
  'presp.visitantes',
  'presp.list', // listagem de fluxo
  'presp.export', // exportação de dados
  'presp.abouthelp' // sobre/ajuda
]);
