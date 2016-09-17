"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ContainerAwareCommand = require("solfegejs/lib/bundles/Console/Command/ContainerAwareCommand");

var _ContainerAwareCommand2 = _interopRequireDefault(_ContainerAwareCommand);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Cron command
 */
class CronCommand extends _ContainerAwareCommand2.default {
  /**
   * Configure command
   */
  *configure() {
    this.setName("manga-downloader:cron");
    this.setDescription("Command for the crontab");
  }

  /**
   * Execute the command
   */
  *execute() {
    console.info("...");
  }
}
exports.default = CronCommand;
module.exports = exports['default'];