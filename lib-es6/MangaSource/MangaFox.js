import { writeFile } from "co-fs-extra"
import request from "request-promise"
import printf from "printf"
import zlib from "zlib"
import bluebird from "bluebird"

/**
 * Manga source: mangafox.me
 */
export default class MangaFox
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
        const pageUrl = `http://mangafox.me/manga/${mangaId}/c${printf("%03d", chapter)}/${page}.html`;

        // Find image URL
        let imageUrl;
        for (let index = 0; index < 5; index++) {
            imageUrl = yield this.findImageUrl(pageUrl);
            if (imageUrl) {
                break;
            }
        }
        if (!imageUrl) {
            return false;
        }

        const fileName = printf("%04d", page);
        const filePath = `${destinationPath}/${fileName}.jpg`;
        const image = yield request({uri: imageUrl, encoding: null});
        yield writeFile(filePath, image);

        console.log(imageUrl, "=>", filePath);
        return true;
    }

    /**
     * Find image URL in a page
     *
     * @param   {string}    pageUrl     Page URL
     * @return  {string}                Image URL
     */
    *findImageUrl(pageUrl:string)
    {
        try {
            let pageContent = yield request({
                uri: pageUrl,
                headers: {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:23.0)"
                },
                resolveWithFullResponse: true,
                followRedirect: false,
                encoding: null
            }).then((response) => {
                var body = (function() {
                    return bluebird.promisify(zlib.gunzip)(response.body);
                })().then(function(buffer) {
                    return buffer.toString("utf8");
                });
                return body;
            });

            let result = pageContent.match(/<img src="([^"]+\.jpg)"/);

            if (result) {
                return result[1];
            }
        } catch (error) {
            return false;
        }

        return false;
    }
}
