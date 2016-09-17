import ContainerAwareCommand from "solfegejs/lib/bundles/Console/Command/ContainerAwareCommand";

/**
 * Cron command
 */
export default class CronCommand extends ContainerAwareCommand
{
    /**
     * Configure command
     */
    *configure()
    {
        this.setName("manga-downloader:cron");
        this.setDescription("Command for the crontab");
    }

    /**
     * Execute the command
     */
    *execute()
    {
        console.info("...");
    }
}
