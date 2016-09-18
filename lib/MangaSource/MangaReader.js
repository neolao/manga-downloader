"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _coFs = require("co-fs");

var _coFs2 = _interopRequireDefault(_coFs);

var _requestPromise = require("request-promise");

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _printf = require("printf");

var _printf2 = _interopRequireDefault(_printf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Manga source: mangareader.net
 */
class MangaReader {
    /**
     * Download manga chapter
     *
     * @param   {string}    mangaId             Manga ID
     * @param   {uint32}    chapter             Chapter number
     * @param   {string}    destinationPath     Destination path
     * @return  {bool}                          true if the chapter is downloaded, false otherwise
     */
    *downloadChapter(mangaId, chapter, destinationPath) {
        if (!(typeof mangaId === 'string')) {
            throw new TypeError("Value of argument \"mangaId\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(mangaId));
        }

        if (!(typeof chapter === 'number' && !isNaN(chapter) && chapter >= 0 && chapter <= 4294967295 && chapter === Math.floor(chapter))) {
            throw new TypeError("Value of argument \"chapter\" violates contract.\n\nExpected:\nuint32\n\nGot:\n" + _inspect(chapter));
        }

        if (!(typeof destinationPath === 'string')) {
            throw new TypeError("Value of argument \"destinationPath\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(destinationPath));
        }

        var page = 1;
        while (true) {
            var result = yield this.downloadChapterPage(mangaId, chapter, page, destinationPath);
            if (!result) {
                break;
            }
            page++;
        }

        if (page > 1) {
            return true;
        }
        return false;
    }

    /**
     * Download manga chapter page
     *
     * @param   {string}    mangaId             Manga ID
     * @param   {uint32}    chapter             Chapter number
     * @param   {uint32}    page                Page number
     * @param   {uint32}    destinationPath     Destination path
     * @return  {bool}                          true if the page is downloaded, false otherwise
     */
    *downloadChapterPage(mangaId, chapter, page, destinationPath) {
        if (!(typeof mangaId === 'string')) {
            throw new TypeError("Value of argument \"mangaId\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(mangaId));
        }

        if (!(typeof chapter === 'number' && !isNaN(chapter) && chapter >= 0 && chapter <= 4294967295 && chapter === Math.floor(chapter))) {
            throw new TypeError("Value of argument \"chapter\" violates contract.\n\nExpected:\nuint32\n\nGot:\n" + _inspect(chapter));
        }

        if (!(typeof page === 'number' && !isNaN(page) && page >= 0 && page <= 4294967295 && page === Math.floor(page))) {
            throw new TypeError("Value of argument \"page\" violates contract.\n\nExpected:\nuint32\n\nGot:\n" + _inspect(page));
        }

        if (!(typeof destinationPath === 'string')) {
            throw new TypeError("Value of argument \"destinationPath\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(destinationPath));
        }

        var pageUrl = "http://www.mangareader.net/" + mangaId + "/" + chapter + "/" + page;
        var result = void 0;

        try {
            var pageContent = yield _requestPromise2.default.get(pageUrl);

            result = pageContent.match(/<img id="img".*?src="([^"]+)"/);
            if (!result) {
                return false;
            }
        } catch (error) {
            return false;
        }

        var imageUrl = result[1];
        var fileName = (0, _printf2.default)("%04d", page);
        var filePath = destinationPath + "/" + fileName + ".jpg";
        var image = yield _requestPromise2.default.get(imageUrl, { encoding: null });
        yield _coFs2.default.writeFile(filePath, image);

        console.log(imageUrl, "=>", filePath);
        return true;
    }
}
exports.default = MangaReader;

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