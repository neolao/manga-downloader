import { ensureFile, readFile, writeFile } from "co-fs-extra"

/**
 * Task manager
 */
export default class TaskManager
{
    /**
     * Constructor
     *
     * @param   {object}    tasks               Tasks configuration
     * @param   {string}    tasksStoragePath    Storage path of the tasks
     */
    constructor(tasks, tasksStoragePath:string)
    {
        this.tasks = tasks
        this.tasksStoragePath = tasksStoragePath;

        this.handlers = new Map;
    }

    /**
     * Add a task handler
     *
     * @param   {string}    name        Handler name
     * @param   {*}         instance    Handler instance
     */
    addHandler(name:string, instance)
    {
        this.handlers.set(name, instance);
    }


    /**
     * Execute a task
     *
     * @param   {string}    taskId  Task identifier
     */
    *execute(taskId:string)
    {
        // Get task configuration
        const taskConfiguration = this.getTaskConfiguration(taskId);
        if (!taskConfiguration) {
            throw new Error(`Unknown task: ${taskId}`);
        }

        // Get handler
        const handlerName = taskConfiguration.handler;
        if (!this.handlers.has(handlerName)) {
            throw new Error(`Task handler not found: ${handlerName}`);
        }

        // Get storage
        const taskStorage = yield this.loadTaskStorage(taskId);

        // Execute the handler
        const handler = this.handlers.get(handlerName);
        const newTaskStorage = yield handler.execute(taskConfiguration, taskStorage);
        yield this.saveTaskStorage(taskId, newTaskStorage);
    }

    /**
     * Get task configuration
     *
     * @param   {string}    taskId  Task identifier
     * @return  {object}            Task configuration
     */
    getTaskConfiguration(taskId:string)
    {
        if (typeof this.tasks !== "object") {
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
    *loadTaskStorage(taskId:string)
    {
        const filePath = `${this.tasksStoragePath}/${taskId}.json`;

        yield ensureFile(filePath);
        const fileContent = yield readFile(filePath);

        let storage = {};
        try {
            storage = JSON.parse(fileContent);
        } catch (error) {
        }

        return storage;
    }

    /**
     * Save a task storage
     *
     * @param   {string}    taskId  Task identifier
     * @param   {object}    storage Task storage
     */
    *saveTaskStorage(taskId:string, storage:Object)
    {
        const filePath = `${this.tasksStoragePath}/${taskId}.json`;

        const fileContent = JSON.stringify(storage, null, "    ");

        yield ensureFile(filePath);
        yield writeFile(filePath, fileContent);
    }
}
