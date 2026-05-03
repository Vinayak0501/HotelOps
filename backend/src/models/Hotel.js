const mongoose = require('mongoose');
// const { checkOut } = require('../controllers/attendance.controller');

const hotelSchema = new mongoose.Schema({

    name:{

        type: String,
        required: true

    },

    config:{

        shifts: [{

            name: String,
            start: String,
            end: String

        }],

        cleaningTimes:{

            checkout: Number,
            occupied: Number,
            vacant: Number

        },

        checkInTime: String,
        checkOutTime: String

    },

    lastReassignDate:{
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Hotel', hotelSchema);