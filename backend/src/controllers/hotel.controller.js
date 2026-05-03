const Hotel = require('../models/Hotel');

const createHotel = async function (req, res) {

    try{

        const { name, config } = req.body;

        if(!name || !config){
            res.status(400).json({
                message: "Name and config are required"
            })
        }

        if(!config.shifts || config.shifts.length === 0){

            return res.status(400).json({
                message: 'At least one shift required'
            })

        }

        if(!config.cleaningTimes.checkout){

            return res.status(400).json({
                message: 'Checkout cleaning time required'
            });

        }

        const hotel = await Hotel.create({
            name,
            config 
        });

        res.status(201).json({
            hotel
        })
    }

    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
    
}

module.exports = { createHotel };