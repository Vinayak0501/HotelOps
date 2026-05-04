const cron = require('node-cron');

function createCronTask(expression, handler) {
  return cron.schedule(expression, handler, {
    // noOverlap: true,
    scheduled: false
  });
}

module.exports = { createCronTask };