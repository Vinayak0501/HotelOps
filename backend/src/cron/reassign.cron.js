const Hotel = require('../models/Hotel');
const Task = require('../models/Task');
const { runAssignmentForHotel } = require('../services/assignment.service');
const { createCronTask } = require('./scheduler');

let isRunning = false;
let reassignCronTask;

async function runReassignForHotel(hotelId) {
  const hotel = await Hotel.findById(hotelId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (hotel.lastReassignDate && new Date(hotel.lastReassignDate) >= today) {
    console.log(`[REASSIGN CRON] Already ran today for ${hotel.name}, skipping`);
    return;
  }

  console.log(`\n[REASSIGN CRON] Processing hotel: ${hotel.name}`);

  hotel.lastReassignDate = new Date();
  await hotel.save();

  await Task.updateMany(
    { hotelId, status: 'paused' },
    {
      $set: { status: 'pending' },
      $unset: { assignedTo: '' }
    }
  );

  const pendingCount = await Task.countDocuments({
    hotelId,
    status: 'pending'
  });

  if (pendingCount === 0) {
    console.log(`[REASSIGN CRON] No pending tasks for ${hotel.name}`);
    return;
  }

  const result = await runAssignmentForHotel(hotelId);
  console.log(`[REASSIGN CRON] assigned: ${result.assigned}, unassigned: ${result.unassigned}`);
}

async function runReassignTask() {
  console.log('\n[REASSIGN CRON] Running...');
  const hotels = await Hotel.find().lean();

  for (const hotel of hotels) {
    await runReassignForHotel(hotel._id);
  }

  console.log('[REASSIGN CRON] Done');
}

async function handleReassignCron() {
  if (isRunning) return;
  isRunning = true;

  try {
    const now = new Date();
    const nowMinutes = (now.getHours() * 60) + now.getMinutes();
    const hotels = await Hotel.find().lean();

    for (const hotel of hotels) {
      if (!hotel.config.shifts || hotel.config.shifts.length < 2) continue;

      const shift2 = hotel.config.shifts[1];
      const [startHour, startMin] = shift2.start.split(':').map(Number);
      const shift2StartMins = (startHour * 60) + startMin;
      const triggerWindow = shift2StartMins - 15;

      if (nowMinutes >= triggerWindow && nowMinutes < triggerWindow + 15) {
        console.log(`[REASSIGN CRON] Triggering for hotel: ${hotel.name}`);
        await runReassignForHotel(hotel._id);
      }
    }
  } catch (err) {
    console.log('[REASSIGN CRON] Error:', err);
  } finally {
    isRunning = false;
  }
}

function startReassignCron() {
  if (reassignCronTask) {
    return reassignCronTask;
  }

  // FIXED: Staggered to whole minutes (2, 17, 32, 47) to avoid CPU overlap
  reassignCronTask = createCronTask('2,17,32,47 * * * *', handleReassignCron);
  reassignCronTask.start();
  return reassignCronTask;
}

module.exports = { runReassignTask, runReassignForHotel, startReassignCron };