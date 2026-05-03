const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// register a user

const registerUser = async function(req, res) {
    

    try{

        const {name, role, skillLevel, assignedFloor, email, password, hotelId } = req.body;

        // basic validation
        // check whether all mandatory fields present or not

        if(!name || !email || !password || !role){
            return res.status(400).json({
                message: "Required field missing"
            })
        }

        // check if user already exists

        const existingUser = await User.findOne({ email });

        if(existingUser){
            return res.status(400).json({
                message: "User already exists"
            })
        }


        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user

        const user = await User.create({
            name,
            role,
            skillLevel,
            assignedFloor,
            email,
            password: hashedPassword,
            hotelId
        });

        // response (never send password)
        res.status(201).json({
            message: "User registered successfully",

            user:{
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                hotelId: user.hotelId
            }
        })
    }

    catch(error){

        res.status(500).json({
            message: "Server error", 
            error : error.message
        });
    }
}


// login
const loginUser = async function(req, res){

    try{

        const { email, password, hotelId } = req.body;

        // validation 

        if(!email || !password){
            
            return res.status(400).json({
                message: "Email and password required"
            })

        }

        if(!hotelId){

            return res.status(400).json({
                message: 'HotelId required'
            })
        }


        // find user
        const user = await User.findOne({ email, hotelId });

        if(!user){
            
            return res.status(400).json({
                message: "Invalid credentials"
            });

        }


        // compare password

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){

            return res.status(400).json({
                message: "Invalid credentials"
            })

        }


        // create token

        const token = jwt.sign({

            id: user._id,
            role: user.role,
            hotelId: user.hotelId

        }, JWT_SECRET,
        { expiresIn: '1d'});

        res.status(200).json({
            message: "Login successful",
            token: token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }

    catch(err){
        
        res.status(500).json({
            message: "Server error",
            error: err.message
        })
    }
}

module.exports = { registerUser, loginUser };