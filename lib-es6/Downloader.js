import printf from "printf";
import fs from "co-fs";
import mkdirp from "mkdirp-then";

/**
 * Downloader
 */
export default class Downlader
{
    /**
     * Constructor
     *
     * @param   {string}    libraryPath     Library path
     * @param   {object}    mangas          Manga list
     */
    constructor(libraryPath:string, mangas)
    {
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
    *downloadChapter(mangaId:string, chapter:uint32)
    {
        // Get manga configuration
        const mangaConfig = this.getMangaConfiguration(mangaId);
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
        const normalizedChapter = printf("%03d", chapter);
        const destinationPath = `${this.libraryPath}/${mangaId}/${normalizedChapter}`;
        yield mkdirp(destinationPath);
        yield source.downloadChapter(id, chapter, destinationPath);
    }

    /**
     * Get manga configuration
     *
     * @param   {string}    mangaId     Manga ID
     * @return  {object}                Manga configuration
     */
    getMangaConfiguration(mangaId:string)
    {
        for (let mangaConfigurationId in this.mangas) {
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
