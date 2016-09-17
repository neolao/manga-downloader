"use strict"

let solfege = require("solfegejs");
let MangaDownloader = require("./lib/Bundle");

let application = solfege.factory();
application.addBundle(new MangaDownloader);

let parameters = process.argv;
parameters.shift();
parameters.shift();
application.start(parameters);
