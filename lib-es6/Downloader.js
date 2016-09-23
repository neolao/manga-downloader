import printf from "printf";
import { readdir } from "co-fs-extra";
import mkdirp from "mkdirp-then";

/**
 * Downloader
 */
export default class Downlader
{
    /**
     * Constructor
     *
     * @param   {string}        libraryPath     Library path
     * @param   {object}        mangas          Manga list
     * @param   {MangaResolver} mangaResolver   Manga resolver
     */
    constructor(libraryPath:string, mangas:Object, mangaResolver)
    {
        this.libraryPath = libraryPath;
        this.mangas = mangas;
        this.mangaResolver = mangaResolver;

        // Initialize sources
        this.sources = new Map();
    }

    /**
     * Download a new chapter
     */
    *downloadNewChapter()
    {
        for (let mangaId in this.mangas) {
            let nextChapter = yield this.mangaResolver.getNextChapter(mangaId);
            let isDownloaded = yield this.downloadChapter(mangaId, nextChapter);
            if (isDownloaded) {
                break;
            }
        }
    }

    /**
     * Downloader a manga chapter into the library
     *
     * @param   {string}    mangaId     Manga ID
     * @param   {uint32}    chapter     Chapter number
     * @return  {bool}                  true if the chapter is downloaded, false otherwise
     */
    *downloadChapter(mangaId:string, chapter:uint32)
    {
        // Get manga configuration
        const mangaConfig = this.mangaResolver.getMangaConfiguration(mangaId);
        if (!mangaConfig) {
            throw new Error(`Manga "${mangaId}" is not configured`);
        }

        const sourceId = mangaConfig.source;
        if (!sourceId) {
            throw new Error(`Manga "${mangaId}" needs a source`);
        }

        const id = mangaConfig.id;
        if (!id) {
            throw new Error(`Manga "${mangaId}" needs an ID`);
        }

        // Get source
        const source = this.getSource(sourceId);
        if (!source) {
            throw new Error(`Manga source "${sourceId}" does not exist`);
        }

        // Download
        const destinationPath = this.mangaResolver.getChapterPath(mangaId, chapter);
        yield mkdirp(destinationPath);
        return yield source.downloadChapter(id, chapter, destinationPath);
    }

    /**
     * Add a manga source
     *
     * @param   {string}    sourceId    Source ID
     * @parma   {object}    source      Source instance
     */
    addSource(sourceId:string, source)
    {
        this.sources.set(sourceId, source);
    }

    /**
     * Get a manga source
     *
     * @param   {string}    sourceId    Source ID
     * @return  {object}                Source instance
     */
    getSource(sourceId:string)
    {
        if (this.sources.has(sourceId)) {
            return this.sources.get(sourceId);
        }

        return null;
    }
}
