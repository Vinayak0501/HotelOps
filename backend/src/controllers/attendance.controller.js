const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const User = require('../models/User');
const Hotel = require('../models/Hotel');

function getShiftWindow(shifts, currentDate = new Date()) {
  const currentMinutes = (currentDate.getHours() * 60) + currentDate.getMinutes();

  for (const shift of shifts || []) {
    const [startHour, startMin] = shift.start.split(':').map(Number);
    const [endHour, endMin] = shift.end.split(':').map(Number);
    const startMinutes = (startHour * 60) + startMin;
    const endMinutes = (endHour * 60) + endMin;

    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      const shiftStart = new Date(currentDate);
      shiftStart.setHours(startHour, startMin, 0, 0);

      const shiftEnd = new Date(currentDate);
      shiftEnd.setHours(endHour, endMin, 59, 999);

      return { shift, shiftStart, shiftEnd, startMinutes };
    }
  }

  return null;
}

async function getCurrentAttendanceRecord(staffId, hotelId) {
  return Attendance.findOne({
    staffId,
    hotelId,
    $or: [
      { checkOutTime: { $exists: false } },
      { checkOutTime: null }
    ]
  }).sort({ checkInTime: -1 });
}

async function getAttendanceStatus(req, res) {
  try {
    const staffId = req.user.id;
    const hotelId = req.user.hotelId;

    const hotel = await Hotel.findById(hotelId).lean();
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const currentShiftInfo = getShiftWindow(hotel.config.shifts, new Date());
    const activeAttendance = await getCurrentAttendanceRecord(staffId, hotelId);

    let shiftAttendance = null;
    if (currentShiftInfo) {
      shiftAttendance = await Attendance.findOne({
        staffId,
        hotelId,
        checkInTime: {
          $gte: currentShiftInfo.shiftStart,
          $lte: currentShiftInfo.shiftEnd,
        }
      }).sort({ checkInTime: -1 });
    }

    res.json({
      checkedIn: Boolean(activeAttendance),
      alreadyCompletedShift: Boolean(shiftAttendance && shiftAttendance.checkOutTime),
      canCheckIn: Boolean(currentShiftInfo) && !activeAttendance && !(shiftAttendance && shiftAttendance.checkOutTime),
      currentShift: currentShiftInfo ? currentShiftInfo.shift : null,
      attendance: activeAttendance || shiftAttendance,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

const checkIn = async function(req, res) {
  try {
    if(req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Only staff can check in' });
    }

    const staffId = req.user.id;
    const hotelId = req.user.hotelId;

    const existing = await getCurrentAttendanceRecord(staffId, hotelId);

    if(existing) {
      return res.status(400).json({ message: 'Already checked in' });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const now = new Date();
    const currentShiftInfo = getShiftWindow(hotel.config.shifts, now);

    if (!currentShiftInfo) {
      return res.status(400).json({ message: 'Check-in is allowed only during an active shift' });
    }

    const previousShiftAttendance = await Attendance.findOne({
      staffId,
      hotelId,
      checkInTime: {
        $gte: currentShiftInfo.shiftStart,
        $lte: currentShiftInfo.shiftEnd,
      }
    }).sort({ checkInTime: -1 });

    if (previousShiftAttendance) {
      return res.status(400).json({
        message: previousShiftAttendance.checkOutTime
          ? 'You have already checked in and checked out for this shift'
          : 'Already checked in'
      });
    }

    const nowMinutes = (now.getHours() * 60) + now.getMinutes();
    const isLate = nowMinutes > currentShiftInfo.startMinutes + 5;

    const attendance = await Attendance.create({
      staffId,
      hotelId,
      checkInTime: now,
      checkOutTime: null,
      isLate
    });

    const { runAssignmentForHotel } = require('../services/assignment.service');
    await runAssignmentForHotel(hotelId);

    res.status(201).json({
      message: isLate ? 'Checked in (late)' : 'Checked in successfully',
      isLate,
      attendance,
      currentShift: currentShiftInfo.shift,
    });

  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};

const checkOut = async function(req, res) {
  try {
    const staffId = req.user.id;
    const hotelId = req.user.hotelId;

    const attendance = await getCurrentAttendanceRecord(staffId, hotelId);

    if(!attendance) {
      const hotel = await Hotel.findById(hotelId).lean();
      const currentShiftInfo = hotel ? getShiftWindow(hotel.config.shifts, new Date()) : null;

      if (currentShiftInfo) {
        const currentShiftAttendance = await Attendance.findOne({
          staffId,
          hotelId,
          checkInTime: {
            $gte: currentShiftInfo.shiftStart,
            $lte: currentShiftInfo.shiftEnd,
          }
        }).sort({ checkInTime: -1 });

        if (currentShiftAttendance?.checkOutTime) {
          return res.status(400).json({ message: 'Already checked out for this shift' });
        }
      }

      return res.status(400).json({ message: 'No active session found' });
    }

    // 1. Take the snapshot
  const currentTasks = await Task.find({ assignedTo: staffId });
  const completedTasksCount = currentTasks.filter(t => t.status === 'completed').length;
  const totalTasksCount = currentTasks.length;

    attendance.checkOutTime = new Date();
    
    attendance.shiftStats = {
      completedTasks: completedTasksCount,
      totalAssigned: totalTasksCount
    };
    await attendance.save();

    await Task.updateMany(
      { assignedTo: staffId, status: 'in-progress' },
      { $set: { status: 'paused' } }
    );

    await Task.updateMany(
      { assignedTo: staffId, status: 'assigned' },
      {
        $set: { status: 'pending' },
        $unset: { assignedTo: '' }
      }
    );

    await User.findByIdAndUpdate(staffId, { $set: { assignedTime: 0 } });

    res.json({ message: 'Checked out successfully', attendance });

  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { checkIn, checkOut, getAttendanceStatus };
