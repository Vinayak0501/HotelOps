const Task = require('../models/Task');
const Attendance = require('../models/Attendance');

// get a staff's all tasks
const myTasks = async function (req, res) {
    
    try{

        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);

        const endOfDay = new Date();
        endOfDay.setHours(23,59,59,999);

        const tasks = await Task.find({

            assignedTo: req.user.id,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        }).populate('roomId', 'roomNo floor roomType');

        res.json(tasks);
    }

    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
};

const startTask = async function (req, res) {
    
    try{

        // check attendance first
        const activeAttendance = await Attendance.findOne({
            staffId: req.user.id,
            hotelId: req.user.hotelId,
            $or: [
                { checkOutTime: { $exists: false} },
                { checkOutTime: null}
            ]
        });

        if(!activeAttendance){

            return res.status(403).json({
                message: 'You must check in before starting a task'
            });

        }

        const task = await Task.findById(req.params.id);

        if(!task){
            return res.status(404).json({
                message: 'Task not found'
            })
        }

        // only assigned staff can start
        if(task.assignedTo.toString() !== req.user.id){
            return res.status(403).json({
                message: 'Not your task'
            })
        }

        // ensure no other task is in-progress

        const activeTask = await Task.findOne({
            assignedTo: req.user.id,
            status: 'in-progress'
        });

        if(activeTask){

            return res.status(400).json({
                message: 'Finish current task first'
            });

        }

        task.status = 'in-progress';
        await task.save();

        res.json({
            message: 'Task started',
            task
        })

    }

    catch(err){
        return res.status(500).json({
            message: err.message
        })
    }
};

// complete task
const completeTask = async function (req, res) {
    
    try{

        // check attendance first
        const activeAttendance = await Attendance.findOne({
            staffId: req.user.id,
            hotelId: req.user.hotelId,
            $or: [
                { checkOutTime: { $exists: false} },
                { checkOutTime: null}
            ]
        });

        if(!activeAttendance){
            return res.status(403).json({
                message: 'You must be actively checked in to complete a task'
            });
        }

        const task = await Task.findById(req.params.id);

        if(!task){
            return res.status(404).json({
                message: "Task not found"
            })
        }

        // only assigned staff can completeTask
        if(task.assignedTo.toString() !== req.user.id){

            return res.status(403).json({
                message: 'Not your task'
            })

        }

        task.status = 'completed';
        task.remainingTime = 0;

        await task.save();

        res.json({
            message: "Task completed",
            task
        })

    }

    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
};

module.exports = { myTasks, startTask, completeTask };