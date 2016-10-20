/* global angular */
angular.module('debug', ['env'])
.factory('Debug', debugFactoryFunction);

function emptyFn() { return 0; }

/* eslint complexity: "off" */
function debugFactoryFunction(ENV) {
  var cfg = ('debug' in ENV) ? ENV.debug : false;

  var Debug = {};
  var error = true;
  var warning = false;
  var info = false;
  var type = typeof cfg;

  switch (type) {
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
      cfg = (cfg) ? 'all' : 'none';
      break;
  }

  var logLevelInfo = [
    'error: ' + error,
    'warning: ' + warning,
    'info: ' + info
  ]

  logLevelInfo = type==='string'||type==='object'||cfg=='none'?[]:logLevelInfo;
  if (error || warning || info) {
    console.info('LogLevel:', cfg, '\n'+logLevelInfo.join('\n'));
  }

  /* eslint no-console: "off" */
  if (error) {
    Debug.error = console.error;
  } else {
    Debug.error = emptyFn;
    console.error = emptyFn;
  }

  if (warning) {
    Debug.warn = console.warn;
  } else {
    Debug.warn = emptyFn;
    console.warn = emptyFn;
  }

  if (info) {
    Debug.log = console.log;
    Debug.info = console.info;
  } else {
    Debug.log = emptyFn;
    Debug.info = emptyFn;
    console.log = emptyFn;
    console.info = emptyFn;
  }

  return Debug;
}
