const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({

    hotelId: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true

    },

    roomId: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true

    },

    checkInDate: Date,
    checkOutDate: Date,

    status: {

        type: String,
        enum: ['upcoming', 'checked-in', 'checked-out'],
        default: 'upcoming'

    }
}, {
    timestamps: true
});

bookingSchema.index({ status: 1});
bookingSchema.index({ hotelId: 1, checkOutDate: 1});
// bookingSchema.index({ hotelId: 1});
module.exports = mongoose.model('Booking', bookingSchema);