/**
 * Convert manga to MobiPocket
 */
export default class Mobi
{
    /**
     * Constructor
     *
     * @param   {object}    kindlegen   Kindlegen service
     */
    constructor(kindlegen)
    {
        this.kindlegen = kindlegen;
    }

    /**
     * Convert
     *
     * @param   {string}    inputPath       Input path
     * @param   {string}    outputPath      Output path
     * @param   {string}    title           Manga title
     * @param   {object}    options         Options
     */
    *convert(inputPath:string, outputPath:string, title:string, options:Object = {})
    {
        yield this.kindlegen.convertManga(inputPath, outputPath, title);
    }
}
