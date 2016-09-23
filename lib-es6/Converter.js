import { exists } from "co-fs-extra"
import { dirname, basename } from "path"

/**
 * Manga converter
 */
export default class Converter
{
    /**
     * Constructor
     *
     * @param   {MangaResolver} mangaResolver   Manga resolver
     */
    constructor(mangaResolver)
    {
        this.mangaResolver = mangaResolver;

        this.formats = new Map;
    }

    /**
     * Add a format converter
     *
     * @param   {string}    name        Format name
     * @param   {*}         instance    Converter instance
     */
    addFormat(name:string, instance)
    {
        this.formats.set(name, instance);
    }

    /**
     * Convert a manga
     *
     * @param   {string}    format      File format
     * @param   {string}    mangaId     Manga ID
     * @param   {uint32}    chapter     Chapter
     * @return  {string}                File path
     */
    *convert(format:string, mangaId:string, chapter:uint32)
    {
        const chapterPath = this.mangaResolver.getChapterPath(mangaId, chapter);
        const title = this.mangaResolver.getChapterTitle(mangaId, chapter);
        let generatedFilePath = `${chapterPath}.${format}`;
        let directory = dirname(generatedFilePath);
        let fileName = basename(generatedFilePath);
        generatedFilePath = `${directory}/${mangaId}-${fileName}`;

        // Check if the file already exists
        if (yield exists(generatedFilePath)) {
            return generatedFilePath;
        }

        // Get format converter
        if (!this.formats.has(format)) {
            throw new Error(`Unable to find format converter: ${format}`);
        }
        const converter = this.formats.get(format);

        // Convert
        console.log(`Converting manga ${mangaId} chapter ${chapter} to ${generatedFilePath}`);
        yield converter.convert(chapterPath, generatedFilePath, title);

        return generatedFilePath;
    }
}
