// Backend/utils/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error("[Error]", err.stack || err);
  res.status(500).json({ error: "Internal server error" });
}

module.exports = errorHandler;