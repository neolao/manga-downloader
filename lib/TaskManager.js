"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _coFsExtra = require("co-fs-extra");

/**
 * Task manager
 */
class TaskManager {
    /**
     * Constructor
     *
     * @param   {object}    tasks               Tasks configuration
     * @param   {string}    tasksStoragePath    Storage path of the tasks
     */
    constructor(tasks, tasksStoragePath) {
        if (!(typeof tasksStoragePath === 'string')) {
            throw new TypeError("Value of argument \"tasksStoragePath\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(tasksStoragePath));
        }

        this.tasks = tasks;
        this.tasksStoragePath = tasksStoragePath;

        this.handlers = new Map();
    }

    /**
     * Add a task handler
     *
     * @param   {string}    name        Handler name
     * @param   {*}         instance    Handler instance
     */
    addHandler(name, instance) {
        if (!(typeof name === 'string')) {
            throw new TypeError("Value of argument \"name\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(name));
        }

        this.handlers.set(name, instance);
    }

    /**
     * Execute a task
     *
     * @param   {string}    taskId  Task identifier
     */
    *execute(taskId) {
        if (!(typeof taskId === 'string')) {
            throw new TypeError("Value of argument \"taskId\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(taskId));
        }

        // Get task configuration
        var taskConfiguration = this.getTaskConfiguration(taskId);
        if (!taskConfiguration) {
            throw new Error("Unknown task: " + taskId);
        }

        // Get handler
        var handlerName = taskConfiguration.handler;
        if (!this.handlers.has(handlerName)) {
            throw new Error("Task handler not found: " + handlerName);
        }

        // Get storage
        var taskStorage = yield this.loadTaskStorage(taskId);

        // Execute the handler
        var handler = this.handlers.get(handlerName);
        var newTaskStorage = yield handler.execute(taskConfiguration, taskStorage);
        yield this.saveTaskStorage(taskId, newTaskStorage);
    }

    /**
     * Get task configuration
     *
     * @param   {string}    taskId  Task identifier
     * @return  {object}            Task configuration
     */
    getTaskConfiguration(taskId) {
        if (!(typeof taskId === 'string')) {
            throw new TypeError("Value of argument \"taskId\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(taskId));
        }

        if (_typeof(this.tasks) !== "object") {
            return null;
        }

        if (!this.tasks.hasOwnProperty(taskId)) {
            return null;
        }

        return this.tasks[taskId];
    }

    /**
     * Load a task storage
     *
     * @param   {string}    taskId  Task identifier
     * @return  {object}            Task storage
     */
    *loadTaskStorage(taskId) {
        if (!(typeof taskId === 'string')) {
            throw new TypeError("Value of argument \"taskId\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(taskId));
        }

        var filePath = this.tasksStoragePath + "/" + taskId + ".json";

        yield (0, _coFsExtra.ensureFile)(filePath);
        var fileContent = yield (0, _coFsExtra.readFile)(filePath);

        var storage = {};
        try {
            storage = JSON.parse(fileContent);
        } catch (error) {}

        return storage;
    }

    /**
     * Save a task storage
     *
     * @param   {string}    taskId  Task identifier
     * @param   {object}    storage Task storage
     */
    *saveTaskStorage(taskId, storage) {
        if (!(typeof taskId === 'string')) {
            throw new TypeError("Value of argument \"taskId\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(taskId));
        }

        if (!(storage instanceof Object)) {
            throw new TypeError("Value of argument \"storage\" violates contract.\n\nExpected:\nObject\n\nGot:\n" + _inspect(storage));
        }

        var filePath = this.tasksStoragePath + "/" + taskId + ".json";

        var fileContent = JSON.stringify(storage, null, "    ");

        yield (0, _coFsExtra.ensureFile)(filePath);
        yield (0, _coFsExtra.writeFile)(filePath, fileContent);
    }
}
exports.default = TaskManager;

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