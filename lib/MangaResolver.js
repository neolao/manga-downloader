"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _printf = require("printf");

var _printf2 = _interopRequireDefault(_printf);

var _coFsExtra = require("co-fs-extra");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Manga resolver
 */
class MangaResolver {
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
     * Get manga chapter path
     *
     * @param   {string}    mangaId     Manga ID
     * @param   {uint32}    chapter     Chapter number
     * @return  {string}                Directory path
     */
    getChapterPath(mangaId, chapter) {
        if (!(typeof mangaId === 'string')) {
            throw new TypeError("Value of argument \"mangaId\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(mangaId));
        }

        if (!(typeof chapter === 'number' && !isNaN(chapter) && chapter >= 0 && chapter <= 4294967295 && chapter === Math.floor(chapter))) {
            throw new TypeError("Value of argument \"chapter\" violates contract.\n\nExpected:\nuint32\n\nGot:\n" + _inspect(chapter));
        }

        return this.libraryPath + "/" + mangaId + "/" + (0, _printf2.default)("%04d", chapter);
    }

    /**
     * Get manga chapter title
     *
     * @param   {string}    mangaId     Manga ID
     * @param   {uint32}    chapter     Chapter number
     * @return  {string}                Chapter title
     */
    getChapterTitle(mangaId, chapter) {
        if (!(typeof mangaId === 'string')) {
            throw new TypeError("Value of argument \"mangaId\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(mangaId));
        }

        if (!(typeof chapter === 'number' && !isNaN(chapter) && chapter >= 0 && chapter <= 4294967295 && chapter === Math.floor(chapter))) {
            throw new TypeError("Value of argument \"chapter\" violates contract.\n\nExpected:\nuint32\n\nGot:\n" + _inspect(chapter));
        }

        return this.mangas[mangaId].title + " " + (0, _printf2.default)("%03d", chapter);
    }

    /**
     * Indicates that the chapter exists
     *
     * @param   {string}    mangaId     Manga ID
     * @param   {uint32}    chapter     Chapter number
     * @return  {boolean}               true if the chapter exists, false otherwise
     */
    *hasChapter(mangaId, chapter) {
        if (!(typeof mangaId === 'string')) {
            throw new TypeError("Value of argument \"mangaId\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(mangaId));
        }

        if (!(typeof chapter === 'number' && !isNaN(chapter) && chapter >= 0 && chapter <= 4294967295 && chapter === Math.floor(chapter))) {
            throw new TypeError("Value of argument \"chapter\" violates contract.\n\nExpected:\nuint32\n\nGot:\n" + _inspect(chapter));
        }

        var chapterPath = this.getChapterPath(mangaId, chapter);
        var chapterExists = yield (0, _coFsExtra.exists)(chapterPath);

        if (!chapterExists) {
            return false;
        }

        var pages = yield (0, _coFsExtra.readdir)(chapterPath);
        if (pages.length > 0) {
            return true;
        }
        return false;
    }

    /**
     * Get the next chapter number
     *
     * @param   {string}    mangaId     Manga ID
     * @return  {uint32}                Next manga chapter
     */
    *getNextChapter(mangaId) {
        if (!(typeof mangaId === 'string')) {
            throw new TypeError("Value of argument \"mangaId\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(mangaId));
        }

        var mangaPath = this.libraryPath + "/" + mangaId;

        function _ref(chapter) {
            var stats = (0, _coFsExtra.lstatSync)(mangaPath + "/" + chapter);
            if (stats.isDirectory()) {
                return true;
            }
            return false;
        }

        try {
            var chapters = yield (0, _coFsExtra.readdir)(mangaPath);
            chapters = chapters.filter(_ref);
            var lastChapter = chapters.pop();

            // Check if the last chapter is empty
            // If not, then the next chapter is the last chapter + 1
            var chapterPath = mangaPath + "/" + lastChapter;
            var pages = yield (0, _coFsExtra.readdir)(chapterPath);
            if (pages.length === 0) {
                return parseInt(lastChapter);
            }
            return parseInt(lastChapter) + 1;
        } catch (error) {
            console.error(error);
            return 1;
        }
    }

}
exports.default = MangaResolver;

function _inspect(input) {
    function _ref3(key) {
        return (/^([A-Z_$][A-Z0-9_$]*)$/i.test(key) ? key : JSON.stringify(key)) + ': ' + _inspect(input[key]) + ';';
    }

    function _ref2(item) {
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

            if (input.every(_ref2)) {
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

        var entries = keys.map(_ref3).join('\n  ');

        if (input.constructor && input.constructor.name && input.constructor.name !== 'Object') {
            return input.constructor.name + ' {\n  ' + entries + '\n}';
        } else {
            return '{ ' + entries + '\n}';
        }
    }
}

module.exports = exports['default'];