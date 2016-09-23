"use strict"

let solfege = require("solfegejs");
let MangaDownloader = require("./lib/Bundle");
let Kindlegen = require("solfegejs-kindlegen");

// Initialize application
let application = solfege.factory();
application.addBundle(new MangaDownloader);
application.addBundle(new Kindlegen);

// Load configuration
application.loadConfiguration(`${__dirname}/config/production.yml`);

// Start application
let parameters = process.argv;
parameters.shift();
parameters.shift();
application.start(parameters);
