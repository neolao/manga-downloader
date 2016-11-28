"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _requestPromise = require("request-promise");

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _zlib = require("zlib");

var _zlib2 = _interopRequireDefault(_zlib);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _phantom = require("phantom");

var _phantom2 = _interopRequireDefault(_phantom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Manga source: scan-manga.com
 */
function _ref4(buffer) {
    return buffer.toString("utf8");
}

function _ref(response) {
    console.log(response);
    var body = function () {
        return _bluebird2.default.promisify(_zlib2.default.gunzip)(response.body);
    }().then(_ref4);
    return body;
}

class ScanManga {
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

        var chaptersPageUrl = "http://www.scan-manga.com/lecture-en-ligne/" + mangaId;
        var chapterUrls = yield this.getChapterUrls(chaptersPageUrl);

        return false;
    }

    /**
     * Get chapter URLs
     *
     * @param   {string}    pageUrl     Page URL
     * @return  {Object}                Chapter URLs
     */
    *getChapterUrls(pageUrl) {
        if (!(typeof pageUrl === 'string')) {
            throw new TypeError("Value of argument \"pageUrl\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(pageUrl));
        }

        console.log(pageUrl);

        var browser = yield _phantom2.default.create();
        var page = yield browser.createPage();
        var status = yield page.open(pageUrl);
        console.log("status: " + status);

        yield browser.exit();
        return false;

        try {
            var pageContent = yield (0, _requestPromise2.default)({
                uri: pageUrl,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36i",
                    "Upgrade-Insecure-Requests": 1
                },
                resolveWithFullResponse: true,
                followRedirect: false,
                encoding: null
            }).then(_ref);

            console.log(pageContent);

            // Get manga ID
            var _searchMangaId = pageContent.match(/list_1_([0-9]+)_/);
            console.log(_searchMangaId);
            if (!_searchMangaId) {
                return false;
            }

            // Get chapter ID
            var _searchChapterId = pageContent.match(/<link rel="alternate" href="http:\/\/m\.scan-manga\.com\/lecture-en-ligne\/(.*)-([0-9]+)_([0-9]+)\.html"/);
            console.log(_searchChapterId);
            if (!_searchChapterId) {
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
        var mandaId = searchMangaId[1];
        var chapterId = searchChapterId[3];

        var listUrl = "http://www.scan-manga.com/lecture-en-ligne/list_1_" + mangaId + "_" + chapterId + ".html";
        console.log(listUrl);

        return false;
    }

}
exports.default = ScanManga;

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