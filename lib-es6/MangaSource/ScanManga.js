import request from "request-promise"
import zlib from "zlib"
import bluebird from "bluebird"
import phantom from "phantom"

/**
 * Manga source: scan-manga.com
 */
export default class ScanManga
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
        const chaptersPageUrl = `http://www.scan-manga.com/lecture-en-ligne/${mangaId}`;
        const chapterUrls = yield this.getChapterUrls(chaptersPageUrl);

        return false;
    }

    /**
     * Get chapter URLs
     *
     * @param   {string}    pageUrl     Page URL
     * @return  {Object}                Chapter URLs
     */
    *getChapterUrls(pageUrl:string)
    {
        console.log(pageUrl);


        let browser = yield phantom.create();
        let page = yield browser.createPage();
        let status = yield page.open(pageUrl);
        console.log("status: "+status);

        yield browser.exit();
        return false;

        try {
            const pageContent = yield request({
                uri: pageUrl,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36i",
                    "Upgrade-Insecure-Requests": 1
                },
                resolveWithFullResponse: true,
                followRedirect: false,
                encoding: null
            }).then((response) => {
                console.log(response);
                var body = (function() {
                    return bluebird.promisify(zlib.gunzip)(response.body);
                })().then(function(buffer) {
                    return buffer.toString("utf8");
                });
                return body;
            });


            console.log(pageContent);

            // Get manga ID
            const searchMangaId = pageContent.match(/list_1_([0-9]+)_/);
            console.log(searchMangaId);
            if (!searchMangaId) {
                return false;
            }

            // Get chapter ID
            const searchChapterId = pageContent.match(/<link rel="alternate" href="http:\/\/m\.scan-manga\.com\/lecture-en-ligne\/(.*)-([0-9]+)_([0-9]+)\.html"/);
            console.log(searchChapterId);
            if (!searchChapterId) {
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
        const mandaId = searchMangaId[1];
        const chapterId = searchChapterId[3];

        const listUrl = `http://www.scan-manga.com/lecture-en-ligne/list_1_${mangaId}_${chapterId}.html`;
        console.log(listUrl);

        return false;
    }

}
