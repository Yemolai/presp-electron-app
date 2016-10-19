/* global angular */
angular.module('debug', ['env'])
.factory('Debug', debugFactoryFunction);

function emptyFn() { return 0; }

/* eslint complexity: "off" */
function debugFactoryFunction(ENV) {
  var cfg = ('debug' in ENV) ? ENV.debug : {};
  var Debug = {};
  var error, warning, info;

  switch (typeof cfg) {
    default:
      error = true;
      warning = false;
      info = false;
      break;
    case 'object':
      error   = ('error'   in cfg) ? cfg.error   : true;
      warning = ('warning' in cfg) ? cfg.warning : false;
      info    = ('info'    in cfg) ? cfg.info    : false;
      break;
    case 'string':
      if (cfg=='e' || cfg=='err' || cfg == 'error') {
        error = true;
      } else
      if (cfg == 'w' || cfg == 'warn' || cfg == 'warning') {
        error = true;
        warning = true;
      } else
      if (cfg=='i'||cfg=='d'||cfg=='l'||cfg=='log'||cfg=='info'||cfg=='debug') {
        error = true;
        warning = true;
        info = true;
      }
      break;
    case 'boolean':
      error = cfg;
      warning = cfg;
      info = cfg;
      break;
  }

  /* eslint no-console: "off" */
  Debug.error = (error)   ? console.error : emptyFn;
  Debug.warn  = (warning) ? console.warn  : emptyFn;
  Debug.info  = (info)    ? console.log   : emptyFn;
  Debug.log   = (info)    ? console.log   : emptyFn;

  return Debug;
}
