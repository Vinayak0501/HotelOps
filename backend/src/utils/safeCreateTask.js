// HELPER TO WARAP TASK CREATION --> SILENTLY IGNORE DUPLICATES

const Task = require('../models/Task');

const safeCreateTask = async function (taskData) {
    
    try{

        const task = await Task.create(taskData);
        return task;

    }

    catch(err){
        if(err.code === 11000){
            // duplicate key ==> task already exists for this room today
            console.log(`[SAFE CREATE] Task already exists for room ${taskData.roomId}, skipping`);
            return null;
        }
        throw err;
    }
};

module.exports = safeCreateTask;