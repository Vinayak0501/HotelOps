const express = require('express');
const router = express.Router();

const { getAllStaff, getTodayAttendance, getTodayTasks, manualAssignTask, getNotifications, markNotificationRead, getStaffPerformance } = require('../controllers/admin.controller');

const { tokenVerificationMiddleware } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

router.get('/staff', tokenVerificationMiddleware, allowRoles('admin'), getAllStaff);
router.get('/attendance/today', tokenVerificationMiddleware, allowRoles('admin'), getTodayAttendance);
router.get('/tasks/today', tokenVerificationMiddleware, allowRoles('admin'), getTodayTasks);
router.patch('/tasks/:taskId/assign', tokenVerificationMiddleware, allowRoles('admin'), manualAssignTask);
router.get('/notifications', tokenVerificationMiddleware, allowRoles('admin'), getNotifications);
router.patch('/notifications/:id/read', tokenVerificationMiddleware, allowRoles('admin'), markNotificationRead);
router.get('/performance', tokenVerificationMiddleware, allowRoles('admin'), getStaffPerformance);

router.get('/debug', tokenVerificationMiddleware, allowRoles('admin'), async (req, res) => {

      const Task = require('../models/Task');
  const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
  const endOfDay = new Date(); endOfDay.setHours(23,59,59,999);
  
  const tasks = await Task.find({
    hotelId: req.user.hotelId,
    date: { $gte: startOfDay, $lte: endOfDay }
  });
  
  res.json({
    hotelIdFromJWT: req.user.hotelId,
    tasksFound: tasks.length,
    sample: tasks[0]
  });

});

module.exports = router;