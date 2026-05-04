const User = require('../models/User');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Notification = require('../models/Notification');

// get remaining minutes from now until shift end
const getRemainingMinutes = function(shiftEnd) {
  const now = new Date();
  const end = new Date();
  const [hours, mins] = shiftEnd.split(':').map(Number);
  end.setHours(hours, mins, 0, 0);
  return Math.max(Math.floor((end - now) / 60000), 0);
};

// detect which shift is currently active
const getCurrentShift = function(shifts) {
  const now = new Date();
  const currentMinutes = (now.getHours() * 60) + now.getMinutes();

  for(let shift of shifts) {
    const [startHour, startMin] = shift.start.split(':').map(Number);
    const [endHour, endMin] = shift.end.split(':').map(Number);
    const startMins = (startHour * 60) + startMin;
    const endMins = (endHour * 60) + endMin;

    if(currentMinutes >= startMins && currentMinutes <= endMins) {
      return shift;
    }
  }
  return null;
};

// get staff capacity — how many minutes they can work from now
const getStaffCapacity = function(checkInTime, shiftEnd) {
  const now = new Date();
  const shiftEndTime = new Date();
  const [hours, mins] = shiftEnd.split(':').map(Number);
  shiftEndTime.setHours(hours, mins, 0, 0);

  // capacity is from NOW (or checkin time whichever is later) to shift end
  const effectiveStart = checkInTime > now ? checkInTime : now;
  return Math.max(Math.floor((shiftEndTime - effectiveStart) / 60000), 0);
};

// core assignment function — assigns a single task to best available staff
const assignTask = async function(task) {

  if(task.status !== 'pending' && task.status !== 'paused') {
    return null;
  }

  const hotel = await Hotel.findById(task.hotelId);
  if(!hotel) return null;

  const shift = getCurrentShift(hotel.config.shifts);
  if(!shift) {
    console.log('No active shift right now');
    return null;
  }

  // PREEMPTION — if this is high priority, pause a lower priority in-progress task
  if(task.status === 'pending' && task.priority === 3) {
    const lowerTask = await Task.findOne({
      hotelId: task.hotelId,
      status: 'in-progress',
      priority: { $lt: task.priority }
    });

    if(lowerTask) {
      const staffId = lowerTask.assignedTo;

      // pause the lower task
      lowerTask.status = 'paused';
      lowerTask.assignedTo = undefined;
      await lowerTask.save();

      // reduce that staff's assignedTime
      await User.findByIdAndUpdate(staffId, {
        $inc: { assignedTime: -lowerTask.estimatedTime }
      });

      // assign high priority task to freed staff
      task.assignedTo = staffId;
      task.status = 'assigned';
      task.shift = shift.name;
      await task.save();

      await User.findByIdAndUpdate(staffId, {
        $inc: { assignedTime: task.estimatedTime }
      });

      console.log('Preemption applied — paused task', lowerTask._id);
      return task;
    }
  }

  // get active attendance for this hotel and shift
  const activeAttendance = await Attendance.find({
    hotelId: task.hotelId,
    $or: [
      { checkOutTime: { $exists: false } },
      { checkOutTime: null }
    ]
  }).populate('staffId');

  if(!activeAttendance.length) {
    console.log('No active staff found');
    return null;
  }

  // build candidates with real capacity
  const candidates = activeAttendance
    .filter(a => a.staffId && a.staffId.role === 'staff') // only staff, not admin
    .map(a => {
      const capacity = getStaffCapacity(a.checkInTime, shift.end);
      const alreadyAssigned = a.staffId.assignedTime || 0;
      const available = capacity - alreadyAssigned;

      return {
        user: a.staffId,
        availableMinutes: available
      };
    })
    .filter(c => c.availableMinutes >= task.estimatedTime); // must have enough time

  if(!candidates.length) {
    console.log('No staff with sufficient capacity for task', task._id);
    return null;
  }

  // skill preference — senior for priority 3 (checkout)
  let filteredCandidates = candidates;
  if(task.priority === 3) {
    const seniors = candidates.filter(c => c.user.skillLevel === 'senior');
    if(seniors.length) filteredCandidates = seniors;
  }

  // floor preference — same floor as room
//   const Room = require('../models/Room');
  const room = await Room.findById(task.roomId);
  if(room) {
    const sameFloor = filteredCandidates.filter(
      c => c.user.assignedFloor === room.floor
    );
    if(sameFloor.length) filteredCandidates = sameFloor;
  }

  // load balancing — pick staff with least assignedTime
  filteredCandidates.sort((a, b) =>
    (a.user.assignedTime || 0) - (b.user.assignedTime || 0)
  );

  const selected = filteredCandidates[0].user;

  // assign task
  task.assignedTo = selected._id;
  task.status = 'assigned';
  task.shift = shift.name;
  await task.save();

  // update staff workload
  await User.findByIdAndUpdate(selected._id, {
    $inc: { assignedTime: task.estimatedTime }
  });

  console.log(`Task ${task._id} assigned to ${selected.name}`);
  return task;
};

// run assignment for all pending tasks in a hotel — called by cron
const runAssignmentForHotel = async function(hotelId) {

  const tasks = await Task.find({
    hotelId,
    status: { $in: ['pending', 'paused'] }
  }).sort({ priority: -1 }); // highest priority first

  console.log(`[ASSIGNMENT] ${tasks.length} tasks to assign for hotel ${hotelId}`);

  let unassigned = [];

  for(let task of tasks) {
    const result = await assignTask(task);
    if(!result) {
      unassigned.push(task);
    }
  }

  // shortfall notification
  if(unassigned.length > 0) {
    const hotel = await Hotel.findById(hotelId);
    const shift = getCurrentShift(hotel.config.shifts);

    await Notification.create({
      hotelId,
      type: 'shortfall',
      recipientRole: 'admin',
      message: `${unassigned.length} tasks could not be assigned for ${shift ? shift.name : 'current'} shift due to staff shortage.`,
      details: {
        unassignedCount: unassigned.length,
        shift: shift ? shift.name : 'unknown',
        rooms: unassigned.map(t => t.roomId)
      }
    });

    console.log(`[ASSIGNMENT] Shortfall alert created — ${unassigned.length} unassigned tasks`);
  }

  return { assigned: tasks.length - unassigned.length, unassigned: unassigned.length };
};

module.exports = { assignTask, runAssignmentForHotel };