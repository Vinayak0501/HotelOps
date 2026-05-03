const Task = require('../models/Task');
const { assignTask } = require('./assignment.service');

const Hotel = require('../models/Hotel');
const safeCreateTask = require('../utils/safeCreateTask');

const getTaskDetails = function(status){

    if(status === 'checkout'){

        return {
            priority: 3
        }

    }

    if(status === 'occupied'){

        return{
            priority: 2
        }

    }

    return{
        priority: 1
    };

};


const createTaskForRoom = async function (room) {

    console.log('Creating task, calling assigntTask');
    const { priority } = getTaskDetails(room.status);
    const hotel = await Hotel.findById(room.hotelId);
    const time = hotel.config.cleaningTimes[room.status];

    if(time === undefined){
        console.log('Invalid cleaning time for: ', room.status);
        return null;
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    const task = await safeCreateTask({

        roomId: room._id,
        hotelId: room.hotelId,
        priority,
        estimatedTime: time,
        remainingTime: time,
        status: 'pending',
        date: today

    });

    if(task)
    console.log('Task hotelId: ', task.hotelId);

    // assign task
    // await assignTask(task);

    return task;

}

module.exports = { createTaskForRoom };