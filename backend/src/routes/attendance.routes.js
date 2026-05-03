const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getAttendanceStatus } = require('../controllers/attendance.controller');
const { tokenVerificationMiddleware } = require('../middleware/auth.middleware');
const Attendance = require('../models/Attendance');

router.post('/checkin', tokenVerificationMiddleware ,checkIn);
router.post('/checkout', tokenVerificationMiddleware,checkOut);
router.get('/status', tokenVerificationMiddleware, getAttendanceStatus);

router.get('/my-history', tokenVerificationMiddleware, async (req, res) => {
  try {
    const Attendance = require('../models/Attendance');
    const records = await Attendance.find({
      staffId: req.user.id,
      hotelId: req.user.hotelId
    }).sort({ checkInTime: -1 }).limit(60);
    res.json(records);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
