// logger.js
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, errors } = format;

// Custom print format with spacing & alignment
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return [
    "============================================",
    `Time    : ${timestamp}`,
    `Level   : ${level.toUpperCase()}`,
    `Message : ${message}`,
    stack ? `Stack   : ${stack}` : "",
    "============================================",
    "",
  ].join("\n");
});

const logger = createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }), // capture full error stack
    logFormat
  ),
  transports: [
    // Save all logs to app.log
    new transports.File({ filename: "logs/app.log" }),
    // Optional: also print to console
    new transports.Console(),
  ],
});

module.exports = logger;
