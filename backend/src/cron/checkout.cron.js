const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const { createTaskForRoom } = require('../services/task.services');
const { runAssignmentForHotel } = require('../services/assignment.service');
const { createCronTask } = require('./scheduler');

let isRunning = false;
let checkoutCronTask;

async function runCheckoutForHotel(hotel) {
  console.log(`\n[CHECKOUT CRON] Processing hotel: ${hotel.name}`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const checkouts = await Booking.find({
    hotelId: hotel._id,
    checkOutDate: { $gte: today, $lte: endOfDay },
    status: 'checked-in'
  });

  if (checkouts.length === 0) {
    console.log(`[CHECKOUT CRON] No checkouts today for ${hotel.name}`);
    return;
  }

  let tasksCreated = 0;

  for (const booking of checkouts) {
    booking.status = 'checked-out';
    await booking.save();

    const room = await Room.findByIdAndUpdate(
      booking.roomId,
      { status: 'checkout' },
      { returnDocument: after }
    );

    const task = await createTaskForRoom(room);

    if (task) {
      tasksCreated++;
      console.log(`[CHECKOUT CRON] Created checkout task for room ${room.roomNo}`);
    } else {
      console.log(`[CHECKOUT CRON] Task already exists for room ${room.roomNo}, skipping`);
    }
  }

  if (tasksCreated > 0) {
    await runAssignmentForHotel(hotel._id);
  }
}

async function runCheckoutTaskCreation() {
  console.log('\n[CHECKOUT CRON] Running...');
  const hotels = await Hotel.find().lean();

  for (const hotel of hotels) {
    await runCheckoutForHotel(hotel);
  }

  console.log('[CHECKOUT CRON] Done');
}

async function handleCheckoutCron() {
  if (isRunning) return;
  isRunning = true;

  try {
    const now = new Date();
    const nowMinutes = (now.getHours() * 60) + now.getMinutes();
    const hotels = await Hotel.find().lean();

    for (const hotel of hotels) {
      if (!hotel.config.checkOutTime) continue;

      const [checkoutHour, checkoutMin] = hotel.config.checkOutTime.split(':').map(Number);
      const checkoutMins = (checkoutHour * 60) + checkoutMin;

      if (nowMinutes >= checkoutMins && nowMinutes < checkoutMins + 15) {
        console.log(`[CHECKOUT CRON] Triggering for hotel: ${hotel.name}`);
        await runCheckoutForHotel(hotel);
      }
    }
  } catch (err) {
    console.log('[CHECKOUT CRON] Error:', err);
  } finally {
    isRunning = false;
  }
}

function startCheckoutCron() {
  if (checkoutCronTask) {
    return checkoutCronTask;
  }

  checkoutCronTask = createCronTask('1,16,31,46 * * * *', handleCheckoutCron);
  checkoutCronTask.start();
  return checkoutCronTask;
}

module.exports = { runCheckoutTaskCreation, runCheckoutForHotel, startCheckoutCron };
