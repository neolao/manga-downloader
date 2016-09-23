"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _coFsExtra = require("co-fs-extra");

var _path = require("path");

/**
 * Manga converter
 */
class Converter {
    /**
     * Constructor
     *
     * @param   {MangaResolver} mangaResolver   Manga resolver
     */
    constructor(mangaResolver) {
        this.mangaResolver = mangaResolver;

        this.formats = new Map();
    }

    /**
     * Add a format converter
     *
     * @param   {string}    name        Format name
     * @param   {*}         instance    Converter instance
     */
    addFormat(name, instance) {
        if (!(typeof name === 'string')) {
            throw new TypeError("Value of argument \"name\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(name));
        }

        this.formats.set(name, instance);
    }

    /**
     * Convert a manga
     *
     * @param   {string}    format      File format
     * @param   {string}    mangaId     Manga ID
     * @param   {uint32}    chapter     Chapter
     * @return  {string}                File path
     */
    *convert(format, mangaId, chapter) {
        if (!(typeof format === 'string')) {
            throw new TypeError("Value of argument \"format\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(format));
        }

        if (!(typeof mangaId === 'string')) {
            throw new TypeError("Value of argument \"mangaId\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(mangaId));
        }

        if (!(typeof chapter === 'number' && !isNaN(chapter) && chapter >= 0 && chapter <= 4294967295 && chapter === Math.floor(chapter))) {
            throw new TypeError("Value of argument \"chapter\" violates contract.\n\nExpected:\nuint32\n\nGot:\n" + _inspect(chapter));
        }

        var chapterPath = this.mangaResolver.getChapterPath(mangaId, chapter);
        var title = this.mangaResolver.getChapterTitle(mangaId, chapter);
        var generatedFilePath = chapterPath + "." + format;
        var directory = (0, _path.dirname)(generatedFilePath);
        var fileName = (0, _path.basename)(generatedFilePath);
        generatedFilePath = directory + "/" + mangaId + "-" + fileName;

        // Check if the file already exists
        if (yield (0, _coFsExtra.exists)(generatedFilePath)) {
            return generatedFilePath;
        }

        // Get format converter
        if (!this.formats.has(format)) {
            throw new Error("Unable to find format converter: " + format);
        }
        var converter = this.formats.get(format);

        // Convert
        console.log("Converting manga " + mangaId + " chapter " + chapter + " to " + generatedFilePath);
        yield converter.convert(chapterPath, generatedFilePath, title);

        return generatedFilePath;
    }
}
exports.default = Converter;

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