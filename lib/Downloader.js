"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _printf = require("printf");

var _printf2 = _interopRequireDefault(_printf);

var _coFs = require("co-fs");

var _coFs2 = _interopRequireDefault(_coFs);

var _mkdirpThen = require("mkdirp-then");

var _mkdirpThen2 = _interopRequireDefault(_mkdirpThen);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Downloader
 */
class Downlader {
    /**
     * Constructor
     *
     * @param   {string}    libraryPath     Library path
     * @param   {object}    mangas          Manga list
     */
    constructor(libraryPath, mangas) {
        if (!(typeof libraryPath === 'string')) {
            throw new TypeError("Value of argument \"libraryPath\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(libraryPath));
        }

        this.libraryPath = libraryPath;
        this.mangas = mangas;

        // Initialize sources
        this.sources = new Map();
    }

    /**
     * Downloader a manga chapter into the library
     *
     * @param   {string}    mangaId     Manga ID
     * @param   {uint32}    chapter     Chapter number
     */
    *downloadChapter(mangaId, chapter) {
        if (!(typeof mangaId === 'string')) {
            throw new TypeError("Value of argument \"mangaId\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(mangaId));
        }

        if (!(typeof chapter === 'number' && !isNaN(chapter) && chapter >= 0 && chapter <= 4294967295 && chapter === Math.floor(chapter))) {
            throw new TypeError("Value of argument \"chapter\" violates contract.\n\nExpected:\nuint32\n\nGot:\n" + _inspect(chapter));
        }

        // Get manga configuration
        var mangaConfig = this.getMangaConfiguration(mangaId);
        if (!mangaConfig) {
            throw new Error("Manga \"" + mangaId + "\" is not configured");
        }

        var sourceId = mangaConfig.source;
        if (!sourceId) {
            throw new Error("Manga \"" + mangaId + "\" needs a source");
        }

        var id = mangaConfig.id;
        if (!id) {
            throw new Error("Manga \"" + mangaId + "\" needs an ID");
        }

        // Get source
        var source = this.getSource(sourceId);
        if (!source) {
            throw new Error("Manga source \"" + sourceId + "\" does not exist");
        }

        // Download
        var normalizedChapter = (0, _printf2.default)("%03d", chapter);
        var destinationPath = this.libraryPath + "/" + mangaId + "/" + normalizedChapter;
        yield (0, _mkdirpThen2.default)(destinationPath);
        yield source.downloadChapter(id, chapter, destinationPath);
    }

    /**
     * Get manga configuration
     *
     * @param   {string}    mangaId     Manga ID
     * @return  {object}                Manga configuration
     */
    getMangaConfiguration(mangaId) {
        if (!(typeof mangaId === 'string')) {
            throw new TypeError("Value of argument \"mangaId\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(mangaId));
        }

        for (var mangaConfigurationId in this.mangas) {
            if (mangaConfigurationId === mangaId) {
                return this.mangas[mangaId];
            }
        }

        return null;
    }

    /**
     * Add a manga source
     *
     * @param   {string}    sourceId    Source ID
     * @parma   {object}    source      Source instance
     */
    addSource(sourceId, source) {
        if (!(typeof sourceId === 'string')) {
            throw new TypeError("Value of argument \"sourceId\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(sourceId));
        }

        this.sources.set(sourceId, source);
    }

    /**
     * Get a manga source
     *
     * @param   {string}    sourceId    Source ID
     * @return  {object}                Source instance
     */
    getSource(sourceId) {
        if (!(typeof sourceId === 'string')) {
            throw new TypeError("Value of argument \"sourceId\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(sourceId));
        }

        if (this.sources.has(sourceId)) {
            return this.sources.get(sourceId);
        }

        return null;
    }
}
exports.default = Downlader;

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