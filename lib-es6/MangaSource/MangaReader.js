import fs from "co-fs";
import request from "request-promise";
import printf from "printf";

/**
 * Manga source: mangareader.net
 */
export default class MangaReader
{
    /**
     * Download manga chapter
     *
     * @param   {string}    mangaId             Manga ID
     * @param   {uint32}    chapter             Chapter number
     * @param   {string}    destinationPath     Destination path
     * @return  {bool}                          true if the chapter is downloaded, false otherwise
     */
    *downloadChapter(mangaId:string, chapter:uint32, destinationPath:string)
    {
        let page = 1;
        while (true) {
            let result = yield this.downloadChapterPage(mangaId, chapter, page, destinationPath);
            if (!result) {
                break;
            }
            page++;
        }

        if (page > 1) {
            return true;
        }
        return false;
    }

    /**
     * Download manga chapter page
     *
     * @param   {string}    mangaId             Manga ID
     * @param   {uint32}    chapter             Chapter number
     * @param   {uint32}    page                Page number
     * @param   {uint32}    destinationPath     Destination path
     * @return  {bool}                          true if the page is downloaded, false otherwise
     */
    *downloadChapterPage(mangaId:string, chapter:uint32, page:uint32, destinationPath:string)
    {
        const pageUrl = `http://www.mangareader.net/${mangaId}/${chapter}/${page}`;
        let result;

        try {
            const pageContent = yield request.get(pageUrl);

            result = pageContent.match(/<img id="img".*?src="([^"]+)"/);
            if (!result) {
                return false;
            }
        } catch (error) {
            return false;
        }

        const imageUrl = result[1];
        const fileName = printf("%04d", page);
        const filePath = `${destinationPath}/${fileName}.jpg`;
        const image = yield request.get(imageUrl, {encoding: null});
        yield fs.writeFile(filePath, image);

        console.log(imageUrl, "=>", filePath);
        return true;

    }
}
