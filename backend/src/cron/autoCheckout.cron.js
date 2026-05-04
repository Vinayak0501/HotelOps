const Hotel = require('../models/Hotel');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const User = require('../models/User');
const { createCronTask } = require('./scheduler');

let isRunning = false;
let autoCheckoutCronTask;

async function runAutoCheckout() {
  console.log('\n[AUTO CHECKOUT CRON] Running...');

  const now = new Date();
  const nowMinutes = (now.getHours() * 60) + now.getMinutes();
  const hotels = await Hotel.find().lean();

  for (const hotel of hotels) {
    if (!hotel.config.shifts) continue;

    for (const shift of hotel.config.shifts) {
      const [endHour, endMin] = shift.end.split(':').map(Number);
      const shiftEndMins = (endHour * 60) + endMin;

      if (nowMinutes < shiftEndMins + 5) continue;

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const activeAttendance = await Attendance.find({
        hotelId: hotel._id,
        checkInTime: { $gte: startOfDay },
        $or: [
          { checkOutTime: { $exists: false } },
          { checkOutTime: null }
        ]
      });

      for (const attendance of activeAttendance) {
        attendance.checkOutTime = new Date();
        attendance.autoCheckout = true;
        await attendance.save();

        await Task.updateMany(
          {
            assignedTo: attendance.staffId,
            status: 'in-progress'
          },
          {
            $set: { status: 'paused' }
          }
        );

        await Task.updateMany(
          {
            assignedTo: attendance.staffId,
            status: 'assigned'
          },
          {
            $set: { status: 'pending' },
            $unset: { assignedTo: '' }
          }
        );

        await User.findByIdAndUpdate(attendance.staffId, {
          $set: { assignedTime: 0 },
        });

        console.log(`[AUTO CHECKOUT] Auto checked out staff: ${attendance.staffId} for hotel: ${hotel.name}`);
      }
    }
  }

  console.log('[AUTO CHECKOUT CRON] Done');
}

async function handleAutoCheckoutCron() {
  if (isRunning) return;
  isRunning = true;

  try {
    await runAutoCheckout();
  } catch (err) {
    console.log('[AUTO CHECKOUT CRON] Error: ', err);
  } finally {
    isRunning = false;
  }
}

function startAutoCheckoutCron() {
  if (autoCheckoutCronTask) {
    return autoCheckoutCronTask;
  }

  autoCheckoutCronTask = createCronTask('*/10 * * * *', handleAutoCheckoutCron);
  autoCheckoutCronTask.start();
  return autoCheckoutCronTask;
}

module.exports = { runAutoCheckout, startAutoCheckoutCron };