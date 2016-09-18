/**
 * Cron command
 */
export default class CronCommand
{
    /**
     * Constructor
     *
     * @param   {Downloader}    downloader  Downloader service
     */
    constructor(downloader)
    {
        this.downloader = downloader;
    }

    /**
     * Get command name
     *
     * @return  {string}    Command name
     */
    getName()
    {
        return "manga-downloader:cron";
    }

    /**
     * Get command description
     *
     * @return  {string}    Command description
     */
    getDescription()
    {
        return "Command for the crontab";
    }

    /**
     * Execute the command
     */
    *execute()
    {
        console.info("...");
    }
}
