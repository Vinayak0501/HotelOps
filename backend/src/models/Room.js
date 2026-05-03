const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({

    roomNo:{
        type: Number,
        required: true,
    },

    roomType:{

        type: String,
        enum: ['VIP', 'Deluxe'],
        required: true

    },

    floor:{

        type: Number,
        required: true

    },

    status:{

        type: String,
        enum: ['occupied', 'vacant', 'checkout'],
        default: 'vacant'

    },

    hotelId:{

        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true

    }

}, {
    timestamps: true
});


roomSchema.index({
    roomNo: 1,
    hotelId: 1
},{ unique: true});

module.exports = mongoose.model('Room', roomSchema);