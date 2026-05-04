// const Hotel = require('../models/Hotel');
// const Booking = require('../models/Booking');
// const Room = require('../models/Room');
// const Task = require('../models/Task');
// const User = require('../models/User');
// const safeCreateTask = require('../utils/safeCreateTask');
// const { runAssignmentForHotel } = require('../services/assignment.service');
// const { createCronTask } = require('./scheduler');

// let isRunning = false;
// let dailyTaskCron;

// async function runDailyTaskCreationForHotel(hotel) {
//   console.log(`\n[DAILY CRON] Processing hotel: ${hotel.name}`);

//   const startOfDay = new Date();
//   startOfDay.setHours(0, 0, 0, 0);
//   const endOfDay = new Date();
//   endOfDay.setHours(23, 59, 59, 999);

//   await User.updateMany(
//     { hotelId: hotel._id, role: 'staff' },
//     { $set: { assignedTime: 0 } }
//   );

//   const rooms = await Room.find({ hotelId: hotel._id }).lean();

//   const checkoutBookings = await Booking.find({
//     hotelId: hotel._id,
//     checkOutDate: { $gte: startOfDay, $lte: endOfDay },
//     status: { $in: ['checked-in', 'upcoming'] }
//   }).lean();

//   const checkoutRoomIds = new Set(
//     checkoutBookings.map((booking) => booking.roomId.toString())
//   );

//   for (const room of rooms) {
//     const roomId = room._id.toString();

//     if (checkoutRoomIds.has(roomId)) continue;

//     const isOccupied = room.status === 'occupied';
//     const priority = isOccupied ? 2 : 1;
//     const cleaningType = isOccupied ? 'occupied' : 'vacant';
//     const estimatedTime = hotel.config.cleaningTimes[cleaningType];

//     const task = await safeCreateTask({
//       roomId: room._id,
//       hotelId: hotel._id,
//       priority,
//       estimatedTime,
//       remainingTime: estimatedTime,
//       status: 'pending',
//       date: new Date()
//     });

//     if (task) {
//       console.log(`[DAILY CRON] Task created for room ${room.roomNo} (${cleaningType})`);
//     }
//   }

//   const yesterday = new Date();
//   yesterday.setDate(yesterday.getDate() - 1);
//   yesterday.setHours(0, 0, 0, 0);

//   const endOfYesterday = new Date();
//   endOfYesterday.setDate(endOfYesterday.getDate() - 1);
//   endOfYesterday.setHours(23, 59, 59, 999);

//   const unfinishedTasks = await Task.find({
//     hotelId: hotel._id,
//     status: { $in: ['pending', 'paused'] },
//     date: { $gte: yesterday, $lte: endOfYesterday }
//   });

//   for (const task of unfinishedTasks) {
//     const existingToday = await Task.findOne({
//       roomId: task.roomId,
//       hotelId: hotel._id,
//       date: { $gte: startOfDay, $lte: endOfDay }
//     });

//     if (existingToday) {
//       task.status = 'cancelled';
//       await task.save();
//       console.log('[DAILY CRON] Cancelled duplicate carried forward task for room');
//       continue;
//     }

//     task.status = 'pending';
//     task.assignedTo = undefined;
//     task.date = new Date();
//     await task.save();
//     console.log(`[DAILY CRON] Carried forward task ${task._id}`);
//   }

//   const result = await runAssignmentForHotel(hotel._id);
//   console.log(`[DAILY CRON] Hotel ${hotel.name} - assigned: ${result.assigned}, unassigned: ${result.unassigned}`);
//   console.log('[DAILY CRON] Completed');
// }

// async function runDailyTaskCreation() {
//   console.log('\n[DAILY CRON] Running...');

//   const hotels = await Hotel.find().lean();

//   for (const hotel of hotels) {
//     await runDailyTaskCreationForHotel(hotel);
//   }

//   console.log('[DAILY CRON] Completed');
// }

// async function handleDailyTaskCron() {
//   if (isRunning) return;

//   isRunning = true;

//   try {
//     const now = new Date();
//     const nowMinutes = (now.getHours() * 60) + now.getMinutes();
//     const hotels = await Hotel.find().lean();

//     for (const hotel of hotels) {
//       const shift1 = hotel.config.shifts[0];
//       const [startHour, startMin] = shift1.start.split(':').map(Number);
//       const shift1StartMins = (startHour * 60) + startMin;
//       const triggerWindow = shift1StartMins - 15;

//       if (nowMinutes >= triggerWindow && nowMinutes < triggerWindow + 15) {
//         console.log(`[DAILY CRON] Triggering for hotel: ${hotel.name}`);
//         await runDailyTaskCreationForHotel(hotel);
//       }
//     }
//   } catch (err) {
//     console.log('[DAILY CRON] Error: ', err);
//   } finally {
//     isRunning = false;
//   }
// }

// function startDailyTaskCron() {
//   if (dailyTaskCron) {
//     return dailyTaskCron;
//   }

//   // Stagger quarter-hour jobs so the process does not try to wake every heavy task on the same second.
//   dailyTaskCron = createCronTask('5 */15 * * * *', handleDailyTaskCron);
//   dailyTaskCron.start();
//   return dailyTaskCron;
// }

// module.exports = { runDailyTaskCreation, runAssignmentForHotel, startDailyTaskCron };


const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Task = require('../models/Task');
const User = require('../models/User');
const safeCreateTask = require('../utils/safeCreateTask');
const { runAssignmentForHotel } = require('../services/assignment.service');
const { createCronTask } = require('./scheduler');

let isRunning = false;
let dailyTaskCron;

async function runDailyTaskCreationForHotel(hotel) {
  console.log(`\n[DAILY CRON] Processing hotel: ${hotel.name}`);

  // 1. Create normalized dates (stripped of hours/minutes/seconds)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // --- IDEMPOTENCY FIX ---
  // If this script runs twice, we must reset the board completely so 
  // staff workloads don't get out of sync with actual assigned tasks.
  
  // Wipe all staff assigned time to 0
  await User.updateMany(
    { hotelId: hotel._id, role: 'staff' },
    { $set: { assignedTime: 0 } }
  );

  // Push all currently 'assigned' tasks back to the 'pending' pool
  await Task.updateMany(
    { hotelId: hotel._id, status: 'assigned' },
    {
      $set: { status: 'pending' },
      $unset: { assignedTo: '' }
    }
  );
  // -----------------------

  const rooms = await Room.find({ hotelId: hotel._id }).lean();

  const checkoutBookings = await Booking.find({
    hotelId: hotel._id,
    checkOutDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['checked-in', 'upcoming'] }
  }).lean();

  const checkoutRoomIds = new Set(
    checkoutBookings.map((booking) => booking.roomId.toString())
  );

  for (const room of rooms) {
    const roomId = room._id.toString();

    if (checkoutRoomIds.has(roomId)) continue;

    const isOccupied = room.status === 'occupied';
    const priority = isOccupied ? 2 : 1;
    const cleaningType = isOccupied ? 'occupied' : 'vacant';
    const estimatedTime = hotel.config.cleaningTimes[cleaningType];

    const task = await safeCreateTask({
      roomId: room._id,
      hotelId: hotel._id,
      priority,
      estimatedTime,
      remainingTime: estimatedTime,
      status: 'pending',
      date: startOfDay // <-- DATE FIX: Using the normalized date to trigger the unique index
    });

    if (task) {
      console.log(`[DAILY CRON] Task created for room ${room.roomNo} (${cleaningType})`);
    }
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const endOfYesterday = new Date();
  endOfYesterday.setDate(endOfYesterday.getDate() - 1);
  endOfYesterday.setHours(23, 59, 59, 999);

  const unfinishedTasks = await Task.find({
    hotelId: hotel._id,
    status: { $in: ['pending', 'paused'] },
    date: { $gte: yesterday, $lte: endOfYesterday }
  });

  for (const task of unfinishedTasks) {
    const existingToday = await Task.findOne({
      roomId: task.roomId,
      hotelId: hotel._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingToday) {
      task.status = 'cancelled';
      await task.save();
      console.log('[DAILY CRON] Cancelled duplicate carried forward task for room');
      continue;
    }

    task.status = 'pending';
    task.assignedTo = undefined;
    task.date = startOfDay; // <-- DATE FIX: Ensure carried forward tasks use the normalized date
    await task.save();
    console.log(`[DAILY CRON] Carried forward task ${task._id}`);
  }

  // Finally, run the assignment algorithm to hand out all the tasks
  const result = await runAssignmentForHotel(hotel._id);
  console.log(`[DAILY CRON] Hotel ${hotel.name} - assigned: ${result.assigned}, unassigned: ${result.unassigned}`);
  console.log('[DAILY CRON] Completed');
}

async function runDailyTaskCreation() {
  console.log('\n[DAILY CRON] Running...');

  const hotels = await Hotel.find().lean();

  for (const hotel of hotels) {
    await runDailyTaskCreationForHotel(hotel);
  }

  console.log('[DAILY CRON] Completed');
}

async function handleDailyTaskCron() {
  if (isRunning) return;

  isRunning = true;

  try {
    const now = new Date();
    const nowMinutes = (now.getHours() * 60) + now.getMinutes();
    const hotels = await Hotel.find().lean();

    for (const hotel of hotels) {
      const shift1 = hotel.config.shifts[0];
      const [startHour, startMin] = shift1.start.split(':').map(Number);
      const shift1StartMins = (startHour * 60) + startMin;
      const triggerWindow = shift1StartMins - 15;

      if (nowMinutes >= triggerWindow && nowMinutes < triggerWindow + 15) {
        console.log(`[DAILY CRON] Triggering for hotel: ${hotel.name}`);
        await runDailyTaskCreationForHotel(hotel);
      }
    }
  } catch (err) {
    console.log('[DAILY CRON] Error: ', err);
  } finally {
    isRunning = false;
  }
}

function startDailyTaskCron() {
  if (dailyTaskCron) {
    return dailyTaskCron;
  }

  // Stagger quarter-hour jobs so the process does not try to wake every heavy task on the same second.
  dailyTaskCron = createCronTask('5 0 4 * * *', handleDailyTaskCron);
  dailyTaskCron.start();
  return dailyTaskCron;
}

module.exports = { runDailyTaskCreation, runAssignmentForHotel, startDailyTaskCron };