const User = require('../models/User');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const LeaveRequest = require('../models/LeaveRequest');
const mongoose = require('mongoose');
// const { completeTask } = require('./task.controller');


// get all the staff for this hotel

const getAllStaff = async function (req, res) {
    
    try{

        const staff = await User.find({
            
            hotelId: req.user.hotelId,
            role: 'staff'

        }).select('-password');


        res.json(staff);
    }

    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
};


// get today's attendance summary

const getTodayAttendance = async function (req, res) {
    
    try{

        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);

        const endOfDay = new Date();
        endOfDay.setHours(23,59,59,999);

        
        const attendance = await Attendance.find({
            
            hotelId: req.user.hotelId,
            checkInTime: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).populate('staffId', 'name email skillLevel assignedFloor');


        const totalStaff = await User.countDocuments({

            hotelId: req.user.hotelId,
            role: 'staff'

        });

        res.json({
            totalStaff,
            present: attendance.length,
            absent: totalStaff - attendance.length,
            attendance
        });

    }

    catch(err){

        res.status(500).json({
            message: err.message
        })

    }
};


// get all tasks for taday with staff info
const getTodayTasks = async function (req, res) {
    
    try{

        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);

        const endOfDay = new Date();
        endOfDay.setHours(23,59,59,999);


        const tasks = await Task.find({

            hotelId: req.user.hotelId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        })
        .populate('roomId', 'roomNo floor roomType status')
        .populate('assignedTo', 'name skillLevel assignedFloor')
        .sort({ priority: -1 });


        // group tasks by status
        const summary = {

            total: tasks.length,
            pending: tasks.filter(t => t.status === 'pending').length,
            assigned: tasks.filter(t => t.status === 'assigned').length,
            inProgress: tasks.filter(t => t.status === 'in-progress').length,
            paused: tasks.filter(t => t.status === 'paused').length,
            completed: tasks.filter(t => t.status === 'completed').length

        };

        res.json({
            summary,
            tasks
        });
    }

    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
};


// manually assign task to a specific staff
const manualAssignTask = async function (req, res) {
    
    try{

        const { staffId } = req.body;
        const taskId = req.params.taskId;

        const task = await Task.findOne({
            _id: taskId,
            hotelId: req.user.hotelId
        });

        
        if(!task){
            return res.status(404).json({
                message: 'Task not found'
            })
        };


        const staff = await User.findOne({

            _id: staffId,
            hotelId: req.user.hotelId,
            role: 'staff'

        });


        if(!staff){
            return res.status(404).json({
                message: 'Staff not found'
            })
        }


        // if task already assigned --> reduce workload of the previously assigned staff

        if(task.assignedTo){

            await User.findByIdAndUpdate(task.assignedTo,{

                $inc: { assignedTime: -task.estimatedTime }
            });

        }

        // assign to new staff
        task.assignedTo = staffId;
        task.status = 'assigned';
        await task.save();


        // upload the workload of new staff
        await User.findByIdAndUpdate(staffId, {
            $inc: { assignedTime: task.estimatedTime }
        });


        res.json({
            message: 'Task manually assigned',
            task
        });

    }

    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
};


// get all unread notifications for this hotel
const getNotifications = async function (req, res) {
    
    try{

        const notifications = await Notification.find({
            hotelId: req.user.hotelId,
            isRead: false
        }).sort({ createdAt: -1 });

        res.json(notifications);

    }

    catch(err){
        res.status(500).json({
            message: err.message
        })
    }

};


// mark notifications as read

const markNotificationRead = async function (req, res) {
    
    try{

        await Notification.findByIdAndUpdate(req.params.id,{
            $set: { isRead: true }
        });

        res.json({
            message: 'Notification marked as read'
        })

    }

    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
};


// get staff performance --> tasks completed today per staff
const getStaffPerformance = async function(req, res) {

  try {

    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);

    // 1. Fetch the staff securely (Query 1)
    const staff = await User.find({
      hotelId: req.user.hotelId,
      role: 'staff'
    }).select('name skillLevel assignedFloor').lean();

    // 2. The Magic: Do all the math in ONE database trip (Query 2)
    const taskStats = await Task.aggregate([
      // Step A: Grab ONLY today's tasks for this hotel
      {
        $match: {
          hotelId: new mongoose.Types.ObjectId(req.user.hotelId),
          date: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      // Step B: Group by the staff member, and run the counters
      {
        $group: {
          _id: '$assignedTo',
          assigned: { $sum: 1 }, // Add 1 for every task found
          completed: {
            // Add 1 ONLY if the status is 'completed'
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } 
          }
        }
      }
    ]);

    // 3. Merge the Aggregation results with the Staff details in Node.js
    const performance = staff.map(s => {
      // Find this staff member's math in our single taskStats array
      const stat = taskStats.find(t => t._id && t._id.toString() === s._id.toString());
      
      const assigned = stat ? stat.assigned : 0;
      const completed = stat ? stat.completed : 0;

      return {
        staff: {
          id: s._id,
          name: s.name,
          skillLevel: s.skillLevel,
          assignedFloor: s.assignedFloor
        },
        assigned,
        completed,
        pending: assigned - completed
      };
    });

    res.json(performance);

  } catch(err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllStaff, getTodayAttendance, getTodayTasks, manualAssignTask, getNotifications, markNotificationRead, getStaffPerformance };