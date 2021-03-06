"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Execute task command
 */
class ExecuteTaskCommand {
    /**
     * Constructor
     *
     * @param   {TaskManager}   taskManager     Task manager
     */
    constructor(taskManager) {
        this.taskManager = taskManager;
    }

    /**
     * Get command name
     *
     * @return  {string}    Command name
     */
    getName() {
        return "manga-downloader:execute-task";
    }

    /**
     * Get command description
     *
     * @return  {string}    Command description
     */
    getDescription() {
        return "Execute a task";
    }

    /**
     * Execute the command
     *
     * @param   {Array}     parameters  Command parameters
     */
    *execute(parameters) {
        if (parameters.length < 1) {
            throw new Error("The command requires 1 parameter: task ID");
        }

        var taskId = parameters[0];
        console.info("Execute task " + taskId + " ...");

        yield this.taskManager.execute(taskId);
    }
}
exports.default = ExecuteTaskCommand;
module.exports = exports['default'];