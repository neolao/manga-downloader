import { basename } from "path"
import { readdir } from "co-fs-extra"
import nodemailer from "nodemailer"

/**
 * Email task handler
 */
export default class Email
{
    /**
     * Constructor
     *
     * @param   {object}            configuration   Configuration
     * @param   {Converter}         converter       Converter service
     * @param   {MangaResolver}     mangaResolver   Manga resolver
     */
    constructor(configuration:Object, converter, mangaResolver)
    {
        this.configuration = configuration;
        this.converter = converter;
        this.mangaResolver = mangaResolver;

        // Initialize transporter
        switch (this.configuration.type) {
            case "smtp":
                let uri = `${this.configuration.protocol}://${this.configuration.login}:${this.configuration.password}@${this.configuration.host}`;
                this.transporter = nodemailer.createTransport(uri);
                break;

            default:
                throw new Error(`Unknown email transporter type: ${this.configuration.type}`);
        }
    }

    /**
     * Execute a task
     *
     * @param   {object}    taskConfiguration   Task configuration
     * @param   {object}    taskStorage         Task storage
     * @rrturn  {object}                        New task storage
     */
    *execute(taskConfiguration:Object, taskStorage:Object)
    {
        let newTaskStorage = Object.assign({}, taskStorage);

        // Check frequency
        const timestamp = Date.now();
        const lastExecution = taskStorage.lastExecution;
        const frequency = taskConfiguration.frequency;
        if (typeof lastExecution === "number" && typeof frequency === "number") {
            let diff = (timestamp - lastExecution) / 1000 / 60;
            if (diff < frequency) {
                let lastExecutionDate = new Date(lastExecution);
                console.log(`Last execution at ${lastExecutionDate}, please wait`);
                return newTaskStorage;
            }
        }

        // Find the manga to process
        if (!newTaskStorage.mangas) {
            newTaskStorage.mangas = {};
        }
        const mangas = taskConfiguration.mangas;
        let selectedMangaId;
        let selectedChapter;
        for (let mangaId of mangas) {
            if (!newTaskStorage.mangas[mangaId]) {
                newTaskStorage.mangas[mangaId] = {};
            }
            const lastSentChapter = newTaskStorage.mangas[mangaId].lastSentChapter;

            // Get the next chapter to send
            let nextChapter = 1;
            if (lastSentChapter) {
                nextChapter = lastSentChapter + 1;
            }

            // Check if the chapter is available
            // Otherwise, continue to the next manga
            if (yield this.mangaResolver.hasChapter(mangaId, nextChapter)) {
                selectedMangaId = mangaId;
                selectedChapter = nextChapter;
                break;
            }
            console.log(`No chapter ${nextChapter} for ${mangaId}`);
        }
        if (!selectedMangaId || !selectedChapter) {
            return newTaskStorage;
        }


        // Convert manga
        const filePath = yield this.converter.convert("mobi", selectedMangaId, selectedChapter);

        // Send email
        console.log(`Sending to ${taskConfiguration.email}: ${filePath}`);
        newTaskStorage.lastExecution = timestamp;
        let mailOptions = {
            from: `"Manga downloader"<${this.configuration.email}>`,
            to: taskConfiguration.email,
            subject: `${selectedMangaId} ${selectedChapter}`,
            text: `${selectedMangaId} ${selectedChapter}`,
            attachments: [
                {
                    filename: basename(filePath),
                    path: filePath
                }
            ]
        };
        yield this.transporter.sendMail(mailOptions);

        // Update storage
        newTaskStorage.mangas[selectedMangaId].lastSentChapter = selectedChapter;

        // Return the updated storage
        return newTaskStorage;
    }
}
