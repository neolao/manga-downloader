"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/**
 * Convert manga to MobiPocket
 */
class Mobi {
  /**
   * Constructor
   *
   * @param   {object}    kindlegen   Kindlegen service
   */
  constructor(kindlegen) {
    this.kindlegen = kindlegen;
  }

  /**
   * Convert
   *
   * @param   {string}    inputPath       Input path
   * @param   {string}    outputPath      Output path
   * @param   {string}    title           Manga title
   * @param   {object}    options         Options
   */
  *convert(inputPath, outputPath, title) {
    var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

    if (!(typeof inputPath === 'string')) {
      throw new TypeError("Value of argument \"inputPath\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(inputPath));
    }

    if (!(typeof outputPath === 'string')) {
      throw new TypeError("Value of argument \"outputPath\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(outputPath));
    }

    if (!(typeof title === 'string')) {
      throw new TypeError("Value of argument \"title\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(title));
    }

    if (!(options instanceof Object)) {
      throw new TypeError("Value of argument \"options\" violates contract.\n\nExpected:\nObject\n\nGot:\n" + _inspect(options));
    }

    yield this.kindlegen.convertManga(inputPath, outputPath, title);
  }
}
exports.default = Mobi;

function _inspect(input) {
  function _ref2(key) {
    return (/^([A-Z_$][A-Z0-9_$]*)$/i.test(key) ? key : JSON.stringify(key)) + ': ' + _inspect(input[key]) + ';';
  }

  function _ref(item) {
    return _inspect(item) === first;
  }

  if (input === null) {
    return 'null';
  } else if (input === undefined) {
    return 'void';
  } else if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
    return typeof input === "undefined" ? "undefined" : _typeof(input);
  } else if (Array.isArray(input)) {
    if (input.length > 0) {
      var first = _inspect(input[0]);

      if (input.every(_ref)) {
        return first.trim() + '[]';
      } else {
        return '[' + input.map(_inspect).join(', ') + ']';
      }
    } else {
      return 'Array';
    }
  } else {
    var keys = Object.keys(input);

    if (!keys.length) {
      if (input.constructor && input.constructor.name && input.constructor.name !== 'Object') {
        return input.constructor.name;
      } else {
        return 'Object';
      }
    }

    var entries = keys.map(_ref2).join('\n  ');

    if (input.constructor && input.constructor.name && input.constructor.name !== 'Object') {
      return input.constructor.name + ' {\n  ' + entries + '\n}';
    } else {
      return '{ ' + entries + '\n}';
    }
  }
}

module.exports = exports['default'];