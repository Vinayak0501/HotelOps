const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({

    staffId: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true

    },

    hotelId: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true

    },

    leaveDate: {
        type: Date,
        required: true
    },

    reason: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    appliedAt: {

        type: Date,
        default: Date.now

    }

}, {timestamps: true});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);