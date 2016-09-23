import printf from "printf"
import { lstatSync, exists, readdir } from "co-fs-extra"

/**
 * Manga resolver
 */
export default class MangaResolver
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
     * Get manga chapter path
     *
     * @param   {string}    mangaId     Manga ID
     * @param   {uint32}    chapter     Chapter number
     * @return  {string}                Directory path
     */
    getChapterPath(mangaId:string, chapter:uint32)
    {
        return `${this.libraryPath}/${mangaId}/${printf("%04d", chapter)}`;
    }

    /**
     * Get manga chapter title
     *
     * @param   {string}    mangaId     Manga ID
     * @param   {uint32}    chapter     Chapter number
     * @return  {string}                Chapter title
     */
    getChapterTitle(mangaId:string, chapter:uint32)
    {
        return `${this.mangas[mangaId].title} ${printf("%03d", chapter)}`;
    }

    /**
     * Indicates that the chapter exists
     *
     * @param   {string}    mangaId     Manga ID
     * @param   {uint32}    chapter     Chapter number
     * @return  {boolean}               true if the chapter exists, false otherwise
     */
    *hasChapter(mangaId:string, chapter:uint32)
    {
        const chapterPath = this.getChapterPath(mangaId, chapter);
        const chapterExists = yield exists(chapterPath);

        if (!chapterExists) {
            return false;
        }

        let pages = yield readdir(chapterPath);
        if (pages.length > 0) {
            return true;
        }
        return false;
    }

    /**
     * Get the next chapter number
     *
     * @param   {string}    mangaId     Manga ID
     * @return  {uint32}                Next manga chapter
     */
    *getNextChapter(mangaId:string)
    {
        const mangaPath = `${this.libraryPath}/${mangaId}`;

        try {
            let chapters = yield readdir(mangaPath);
            chapters = chapters.filter((chapter) => {
                let stats = lstatSync(`${mangaPath}/${chapter}`);
                if (stats.isDirectory()) {
                    return true;
                }
                return false;
            });
            const lastChapter = chapters.pop();

            // Check if the last chapter is empty
            // If not, then the next chapter is the last chapter + 1
            const chapterPath = `${mangaPath}/${lastChapter}`;
            const pages = yield readdir(chapterPath);
            if (pages.length === 0) {
                return parseInt(lastChapter);
            }
            return parseInt(lastChapter) + 1;
        } catch (error) {
            console.error(error);
            return 1;
        }
    }

}
