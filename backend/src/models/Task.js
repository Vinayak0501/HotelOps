const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({

    date:{

        type: Date,
        default: Date.now

        // NOTE: we have used Date.now and not Date.now()
        // this is because if called the function --> then it will get executed as soon as we start the server
        // all the entries would have same date
        // by doing so --> we leave it to mongoose --> whenever a new doc is created --> run this function to get the exact milliseconds
    },

    roomId:{
        
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true

    },

    hotelId: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
        
    },

    shift: {
        type: String 
    },

    priority:{
    
        type: Number, // 1->low, 2->medium, 3-> high 
        required: true

    },

    status:{
        
        type: String,
        enum: ['pending', 'assigned', 'in-progress', 'paused', 'completed', 'cancelled'],
        default: 'pending'

    },

    assignedTo:{

        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'

    },

    estimatedTime:{

        type: Number, // in minutes

    },

    timeSpent:{

        type: Number,
        default: 0

    },

    remainingTime:{

        type: Number
    },

    startedAt: {
        type: Date
    }

}, {
    timestamps: true
});


// COMPOUND UNIQUE INDEX ==> prevents duplicate tasks for same room on same day with same priority
taskSchema.index(
    {roomId: 1, hotelId: 1, date: 1, priority: 1},
    { unique: true }
);


module.exports = mongoose.model('Task', taskSchema);