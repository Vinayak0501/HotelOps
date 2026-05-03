const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({

    name:{
        type: String,
        required: true
    },

    role:{
        type: String,
        enum: ['admin', 'staff'], // only these strings are allowed
        required: true,
    },

    skillLevel:{
        type: String,
        enum: ['junior', 'senior'], // only these strings are allowed
        required: true
    },

    assignedFloor: {
        type: Number,
    },

    email:{
        type: String,
        required: true,
        unique: true
    },

    password:{
        type: String,
        required: true
    },

    assignedTime:{
        // to keep track of workload on the user
        // useful for load balancing
        type: Number,
        default: 0
    },

    hotelId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    }

}, {
    timestamps: true // automatically adds --> createdAt, updatedAt
});

module.exports = mongoose.model('User', userSchema);