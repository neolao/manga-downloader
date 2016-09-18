"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Load chapter command
 */
class LoadChapterCommand {
    /**
     * Constructor
     *
     * @param   {Downloader}    downloader  Downloader service
     */
    constructor(downloader) {
        this.downloader = downloader;
    }

    /**
     * Get command name
     *
     * @return  {string}    Command name
     */
    getName() {
        return "manga-downloader:load-chapter";
    }

    /**
     * Get command description
     *
     * @return  {string}    Command description
     */
    getDescription() {
        return "Load a manga chapter";
    }

    /**
     * Execute the command
     *
     * @param   {Array}     parameters  Command parameters
     */
    *execute(parameters) {
        if (parameters.length < 2) {
            throw new Error("The command requires 2 parameters: manga ID and chapter number");
        }

        var mangaId = parameters[0];
        var chapter = parseInt(parameters[1]);
        console.info("Load " + mangaId + " chapter " + chapter + " ...");

        yield this.downloader.downloadChapter(mangaId, chapter);
    }
}
exports.default = LoadChapterCommand;
module.exports = exports['default'];