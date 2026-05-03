const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({

    hotelId: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true

    },

    type: {

        type: String,
        enum: ['shortfall', 'leave_approved', 'leave_rejected', 'leave_request'],
        required: true

    },

    message: {
        
        type: String,
        required: true

    },

    recipientRole: {
        type: String,
        enum: ['admin', 'staff', 'all'],
        default: 'admin'
    },

    recipientUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    details: {

        unassignedCount: Number,
        shift: String,
        leaveId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LeaveRequest'
        },
        rooms: [{

            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room'

        }]
    },

    isRead: {
        type: Boolean,
        default: false
    }
    
}, { timestamps: true});

module.exports = mongoose.model('Notification', notificationSchema);
