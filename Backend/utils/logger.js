// Backend/utils/logger.js
function log(message, ...args) {
  console.log(`[LOG] ${new Date().toISOString()} - ${message}`, ...args);
}

function warn(message, ...args) {
  console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
}

function error(message, ...args) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
}

module.exports = { log, warn, error };