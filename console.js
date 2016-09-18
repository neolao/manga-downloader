"use strict"

let solfege = require("solfegejs");
let MangaDownloader = require("./lib/Bundle");

// Initialize application
let application = solfege.factory();
application.addBundle(new MangaDownloader);

// Load configuration
application.loadConfiguration(`${__dirname}/config/production.yml`);

// Start application
let parameters = process.argv;
parameters.shift();
parameters.shift();
application.start(parameters);
