const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({

    staffId:{

        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true

    },

    hotelId: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true

    },

    checkInTime:{

        type: Date,
        required: true

    },

    checkOutTime:{

        type: Date,
        default: null
        
    },

    isLate:{
        type: 'Boolean',
        default: false
    },

    autoCheckout: {
        type: Boolean,
        default: false
    },

    shiftStats: {
        completedTasks: { type: Number, default: 0},
        totalAssigned: { type: Number, default: 0}
    }

},{
    timestamps: true
});

module.exports = mongoose.model('Attendance', AttendanceSchema);