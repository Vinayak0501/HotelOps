// const User = require('../models/User');
// const Task = require('../models/Task');
// const Attendance = require('../models/Attendance');
// const Hotel = require('../models/Hotel')

// const getRemainingMinutes = function(shiftEndTime){

//     const now = new Date(); // current time
//     const end = new Date();

//     // shiftEndTime --> string of format 'HH:MM' --> extract the hours and mins from this string
//     const [hours, mins] = shiftEndTime.split(':');
    
//     end.setHours(hours, mins, 0, 0);

//     const minutesRemaining = Math.floor((end-now)/60000);

//     return Math.max(minutesRemaining, 0);
// }

// // SHIFT DETECTION 
// const getCurrentShift = function(shifts){

//     const now = new Date();

//     const currentMinutes = (now.getHours() * 60) + now.getMinutes();
//     // now.getHours() --> how many hours passed past midnight
//     // now.getMinutes() --> eg: it is 2:30 --> now.getMinutes = 30 mins

//     // console.log('Shifts: ', hotel.config.shifts);
//     console.log('Current minutes: ', currentMinutes);

//     for(let shift of shifts){

//         const [ startHour, startMin ] = shift.start.split(':').map(Number);
//         const [ endHour, endMin ] = shift.end.split(':').map(Number);

//         const startMins = (startHour *  60) + startMin;
//         const endMins = (endHour * 60) + endMin;

//         console.log("Checking shift:", shift);
//         console.log("Start:", startMins, "End:", endMins);

//         if(currentMinutes >= startMins && currentMinutes <= endMins){
//             return shift;
//         }

//     }

//     return null; // no active shift
// }

// const assignTask = async function (task) {

//     // assign pending task only
//     if(task.status !== 'pending'){
//         return null;
//     }

//     // PREEMPTION
//     const lowerTasks = await Task.find({
//         status: 'in-progress',
//         priority: { $lt: task.priority } // finds all task with priority < priority of current task
//     });

//     if(lowerTasks.length){

//         const toPause = lowerTasks[0];

//         // pause lower priority task
//         toPause.status = 'paused';
//         await toPause.save();

//         // assign new high priority task to same staff
//         task.assignedTo = toPause.assignedTo;
//         task.status = 'assigned';
//         await task.save();

//         console.log('Preemption applied');

//         return task;
//     }

//     // get active attendance (available staff) for a given hotel

//     const activeStaff = await Attendance.find({

//         hotelId: task.hotelId,

//         $or: [
//             { checkOutTime: { $exists: false }},
//             { checkOutTime: null }
//         ]
//     }).populate('staffId');
//     // $exists ==> special mongoDB operator 
//     // checkout : { $exists: false } means find that entries which doesn't have checkOutTime yet.
//     // .populate(staffId) means --> push the found users to the activeStaff 
//     console.log("Active staff: ", activeStaff);
//     if(!activeStaff.length){
//         // no staff available
//         return null;
//     }

//     const hotel = await Hotel.findById(task.hotelId);

//     // // assuming morning shifts
//     // const shift = hotel.config.shifts[0];
//     // console.log('Using shift: ', shift);

//     // find the current shift
//     const shift = getCurrentShift(hotel.config.shifts);

//     if(!shift){
//         console.log('No active shift right now');
//         return null;
//     }

//     console.log('Current time: ', new Date());
//     console.log('Selected shift: ', shift);

//     // find eligible staff with remaining time

//     const candidates = activeStaff.map( (s => {

//         // const remaining = getRemainingMinutes(s.checkInTime);
//         const remaining = getRemainingMinutes(shift.end);

//         return{
//             user: s.staffId,
//             remaining
//         };

//     }))
//     // must have enough time
//     .filter(function(c){

//         const assigned = c.user.assignedTime || 0; // currently assignedTime to the staff, or 0 if no work assigned yet
//         // return (assigned + task.estimatedTime) <= c.remaining;
//         return true;

//     });

//     //.map --> finds the remaining time of all the available staff
//     // .filter --> once remainingTime calculated --> finds which candidate has enough time for the assigned task

//     if(!candidates.length){
//         // no staff with sufficient time available
//         return null;
//     }


//     // skill preference

//     let filteredStaff = candidates;

//     if(task.priority === 3){

//         const seniorStaff = candidates.filter( c => c.user.skillLevel === 'senior'); 
        
//         if(seniorStaff.length){
//             filteredStaff = seniorStaff; // prefer senior staff if available
//         }

//     }

//     // pick least loaded among filtered staff
//     filteredStaff.sort(function(s1, s2){

//         return (s1.user.assignedTime || 0) - (s2.user.assignedTime || 0);

//     })

//     const selectedStaff = filteredStaff[0].user;
//     console.log("selected staff: ", selectedStaff);

//     // assign the task

//     task.assignedTo = selectedStaff._id;
//     task.status = 'assigned';
//     await task.save();


//     // update the workload
//     selectedStaff.assignedTime = (selectedStaff.assignedTime || 0) + task.estimatedTime;
//     await selectedStaff.save();

//     return task;

// }

// module.exports = { assignTask };


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