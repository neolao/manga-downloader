"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _path = require("path");

var _coFsExtra = require("co-fs-extra");

var _nodemailer = require("nodemailer");

var _nodemailer2 = _interopRequireDefault(_nodemailer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Email task handler
 */
class Email {
    /**
     * Constructor
     *
     * @param   {object}            configuration   Configuration
     * @param   {Converter}         converter       Converter service
     * @param   {MangaResolver}     mangaResolver   Manga resolver
     */
    constructor(configuration, converter, mangaResolver) {
        if (!(configuration instanceof Object)) {
            throw new TypeError("Value of argument \"configuration\" violates contract.\n\nExpected:\nObject\n\nGot:\n" + _inspect(configuration));
        }

        this.configuration = configuration;
        this.converter = converter;
        this.mangaResolver = mangaResolver;

        // Initialize transporter
        switch (this.configuration.type) {
            case "smtp":
                var uri = this.configuration.protocol + "://" + this.configuration.login + ":" + this.configuration.password + "@" + this.configuration.host;
                this.transporter = _nodemailer2.default.createTransport(uri);
                break;

            default:
                throw new Error("Unknown email transporter type: " + this.configuration.type);
        }
    }

    /**
     * Execute a task
     *
     * @param   {object}    taskConfiguration   Task configuration
     * @param   {object}    taskStorage         Task storage
     * @rrturn  {object}                        New task storage
     */
    *execute(taskConfiguration, taskStorage) {
        if (!(taskConfiguration instanceof Object)) {
            throw new TypeError("Value of argument \"taskConfiguration\" violates contract.\n\nExpected:\nObject\n\nGot:\n" + _inspect(taskConfiguration));
        }

        if (!(taskStorage instanceof Object)) {
            throw new TypeError("Value of argument \"taskStorage\" violates contract.\n\nExpected:\nObject\n\nGot:\n" + _inspect(taskStorage));
        }

        var newTaskStorage = Object.assign({}, taskStorage);

        // Check frequency
        var timestamp = Date.now();
        var lastExecution = taskStorage.lastExecution;
        var frequency = taskConfiguration.frequency;
        if (typeof lastExecution === "number" && typeof frequency === "number") {
            var diff = (timestamp - lastExecution) / 1000 / 60;
            if (diff < frequency) {
                var lastExecutionDate = new Date(lastExecution);
                console.log("Last execution at " + lastExecutionDate + ", please wait");
                return newTaskStorage;
            }
        }

        // Find the manga to process
        if (!newTaskStorage.mangas) {
            newTaskStorage.mangas = {};
        }
        var mangas = taskConfiguration.mangas;
        var selectedMangaId = void 0;
        var selectedChapter = void 0;

        if (!(mangas && (typeof mangas[Symbol.iterator] === 'function' || Array.isArray(mangas)))) {
            throw new TypeError("Expected mangas to be iterable, got " + _inspect(mangas));
        }

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = mangas[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var mangaId = _step.value;

                if (!newTaskStorage.mangas[mangaId]) {
                    newTaskStorage.mangas[mangaId] = {};
                }
                var lastSentChapter = newTaskStorage.mangas[mangaId].lastSentChapter;

                // Get the next chapter to send
                var nextChapter = 1;
                if (lastSentChapter) {
                    nextChapter = lastSentChapter + 1;
                }

                // Check if the chapter is available
                // Otherwise, continue to the next manga
                if (yield this.mangaResolver.hasChapter(mangaId, nextChapter)) {
                    selectedMangaId = mangaId;
                    selectedChapter = nextChapter;
                    break;
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        if (!selectedMangaId || !selectedChapter) {
            return newTaskStorage;
        }

        // Convert manga
        var filePath = yield this.converter.convert("mobi", selectedMangaId, selectedChapter);

        // Send email
        console.log("Sending to " + taskConfiguration.email + ": " + filePath);
        newTaskStorage.lastExecution = timestamp;
        var mailOptions = {
            from: "\"Manga downloader\"<" + this.configuration.email + ">",
            to: taskConfiguration.email,
            subject: selectedMangaId + " " + selectedChapter,
            text: selectedMangaId + " " + selectedChapter,
            attachments: [{
                filename: (0, _path.basename)(filePath),
                path: filePath
            }]
        };
        yield this.transporter.sendMail(mailOptions);

        // Update storage
        newTaskStorage.mangas[selectedMangaId].lastSentChapter = selectedChapter;

        // Return the updated storage
        return newTaskStorage;
    }
}
exports.default = Email;

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