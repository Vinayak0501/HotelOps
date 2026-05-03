const { startDailyTaskCron } = require('./dailyTasks.cron');
const { startReassignCron } = require('./reassign.cron');
const { startCheckoutCron } = require('./checkout.cron');
const { startAutoCheckoutCron } = require('./autoCheckout.cron');

let hasStarted = false;

function startCronJobs() {
  if (hasStarted) {
    return;
  }

  startDailyTaskCron();
  startReassignCron();
  startCheckoutCron();
  startAutoCheckoutCron();

  hasStarted = true;
  console.log('[CRON] All cron jobs started');
}

module.exports = { startCronJobs };
