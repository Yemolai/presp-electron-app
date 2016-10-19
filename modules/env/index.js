angular.module('env', [])
.constant('ENV', require(__dirname+'/.env.js'));
