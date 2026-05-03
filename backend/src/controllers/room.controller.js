// createRoom, get all rooms, updaet room status
const Room = require('../models/Room');
const { createTaskForRoom } = require('../services/task.services');

// createRoom

const createRoom = async function (req, res) {
    
    try{

        const {roomNo, roomType, floor, status} = req.body;

        // basic validation
        if(!roomNo || !roomType || !floor){
            
            return res.status(400).json({
                message: 'All fields required'
            });

        }

        // check if room already exists
        const existingRoom = await Room.findOne({ 
            roomNo,
            hotelId: req.user.hotelId
         });

        if(existingRoom){

            return res.status(400).json({
                message: "Room already exists"
            });

        }

        const room = await Room.create({

            roomNo,
            roomType,
            floor,
            hotelId: req.user.hotelId,
            status

        });

        res.status(201).json({
            message: "Room created", 
            room: room
        })

    }

    catch(err){

        res.status(500).json({
            message: err.message
        });

    };

};

// get all rooms

const getRooms = async function (req, res) {
    
    try{

        const rooms = await Room.find({
            hotelId: req.user.hotelId
        });

        res.json(rooms);

    }

    catch(err){
        
        res.status(500).json({
            message: err.message
        });

    }
};


// update room status
const updateRoom = async function (req, res) {
    
    try{

        const { status } = req.body;
        const roomId = req.params.id;

        const room = await Room.findOne({
            _id: req.params.id,
            hotelId: req.user.hotelId
        });

        if(!room){

            return res.status(404).json({
                message: "Room not found"
            });

        }

        room.status = status; // updating the status
        await room.save(); // saving the updated room

        // after updating room status ==> create a new task for that room
        // await createTaskForRoom(room);

        res.json({
            message: "Room updated",
            room: room
        });

    }

    catch(err){

        res.status(500).json({
            message: err.message
        });

    }
};

module.exports = { createRoom, getRooms, updateRoom };